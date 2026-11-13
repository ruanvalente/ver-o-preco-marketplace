import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import { LISTING_IMAGE_BUCKET } from "../constants";
import { isListingId } from "../schemas/listing.schemas";
import type {
  Listing,
  ListingImageInput,
  ListingInput,
  ListingMutationResult,
  ListingServiceResult,
  ListingSummary,
} from "../types/listing.types";
import {
  mapListing,
  mapListingSummary,
  type ListingRow,
  type MapListingOptions,
} from "../utils/listing-mappers";

const LISTING_SELECT = `
  id,
  seller_id,
  title,
  description,
  price,
  condition,
  city,
  neighborhood,
  status,
  created_at,
  updated_at,
  category:categories!products_category_id_fkey ( id, slug, name ),
  images:product_images ( id, storage_path, alt_text, sort_order, is_primary )
`;

const LOAD_ERROR = "Não foi possível carregar o anúncio.";
const SAVE_ERROR = "Não foi possível salvar o anúncio.";
const IMAGE_ERROR = "Não foi possível salvar as imagens do anúncio.";
const NOT_FOUND_ERROR =
  "Anúncio não encontrado ou sem permissão para editá-lo.";
const PUBLISH_ERROR =
  "As alterações foram salvas, mas não foi possível publicar o anúncio.";
const PUBLISH_REQUIRES_IMAGE =
  "Adicione pelo menos uma imagem antes de publicar o anúncio.";
const DELETE_ERROR = "Não foi possível excluir o anúncio.";

function failure<T>(context: string, error: unknown): ListingServiceResult<T> {
  console.error(`[listings] ${context}`, error);
  return { ok: false, error: LOAD_ERROR };
}

function createMapperOptions(supabase: SupabaseClient): MapListingOptions {
  return {
    resolveImageUrl: (storagePath) => {
      if (!storagePath) {
        return "";
      }

      if (storagePath.startsWith("/") || storagePath.startsWith("http")) {
        return storagePath;
      }

      return supabase.storage
        .from(LISTING_IMAGE_BUCKET)
        .getPublicUrl(storagePath).data.publicUrl;
    },
  };
}

function toRpcImages(images: ListingImageInput[]) {
  return images.map((image) => ({
    storage_path: image.storagePath,
    alt_text: image.altText,
    sort_order: image.sortOrder,
    is_primary: image.isPrimary,
  }));
}

function belongsToUser(storagePath: string, userId: string): boolean {
  return storagePath.startsWith(`${userId}/`) && !storagePath.includes("..");
}

/**
 * Busca um anúncio do próprio usuário, incluindo rascunhos e pausados.
 *
 * A consulta filtra explicitamente por `seller_id` além de depender da RLS.
 * Isso mantém a regra de propriedade legível na camada de serviço e evita
 * depender de uma única camada de proteção.
 */
export async function getListingForOwner(
  userId: string,
  listingId: string,
): Promise<ListingServiceResult<Listing | null>> {
  if (!isListingId(listingId)) {
    return { ok: true, data: null };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(LISTING_SELECT)
      .eq("id", listingId)
      .eq("seller_id", userId)
      .maybeSingle();

    if (error) {
      return failure("getListingForOwner", error);
    }

    if (!data) {
      return { ok: true, data: null };
    }

    return {
      ok: true,
      data: mapListing(
        data as unknown as ListingRow,
        createMapperOptions(supabase),
      ),
    };
  } catch (error) {
    return failure("getListingForOwner", error);
  }
}

/**
 * Lista os anúncios do usuário para a área de gerenciamento.
 *
 * Anúncios com status `removed` são excluídos da listagem: o fluxo atual
 * remove a linha do banco ao excluir, e `removed` fica reservado para uma
 * futura moderação.
 */
export async function getListingsForOwner(
  userId: string,
  limit = 100,
): Promise<ListingServiceResult<ListingSummary[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(LISTING_SELECT)
      .eq("seller_id", userId)
      .neq("status", "removed")
      .order("updated_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 200));

    if (error) {
      return failure("getListingsForOwner", error);
    }

    const options = createMapperOptions(supabase);

    return {
      ok: true,
      data: ((data ?? []) as unknown as ListingRow[]).map((row) =>
        mapListingSummary(row, options),
      ),
    };
  } catch (error) {
    return failure("getListingsForOwner", error);
  }
}

type CreateListingParams = {
  userId: string;
  input: ListingInput;
  images: ListingImageInput[];
  publish: boolean;
};

/**
 * Cria um anúncio como rascunho, associa as imagens e só então publica.
 *
 * Criar como rascunho evita que o catálogo público encontre um anúncio sem
 * imagens enquanto o upload/associação ainda está em andamento. Se a associação
 * falhar, a linha é removida; os arquivos já enviados permanecem no Storage
 * para que uma nova tentativa possa reaproveitá-los.
 */
export async function createListing({
  userId,
  input,
  images,
  publish,
}: CreateListingParams): Promise<ListingMutationResult<Listing>> {
  try {
    const supabase = await createClient();
    const { data: created, error: insertError } = await supabase
      .from("products")
      .insert({
        seller_id: userId,
        category_id: input.categoryId,
        title: input.title,
        description: input.description,
        price: input.price,
        condition: input.condition,
        city: input.city,
        neighborhood: input.neighborhood,
        status: "draft",
      })
      .select("id")
      .single();

    if (insertError || !created) {
      console.error("[listings] createListing insert", insertError);
      return { ok: false, error: SAVE_ERROR };
    }

    const listingId = created.id as string;

    if (images.length > 0) {
      const { error: imageError } = await supabase.rpc(
        "replace_product_images",
        {
          p_product_id: listingId,
          p_images: toRpcImages(images),
        },
      );

      if (imageError) {
        console.error("[listings] createListing images", imageError);
        await supabase
          .from("products")
          .delete()
          .eq("id", listingId)
          .eq("seller_id", userId);

        return { ok: false, error: IMAGE_ERROR, field: "images" };
      }
    }

    if (publish) {
      const { error: publishError } = await supabase
        .from("products")
        .update({ status: "active" })
        .eq("id", listingId)
        .eq("seller_id", userId);

      if (publishError) {
        console.error("[listings] createListing publish", publishError);
        return {
          ok: false,
          error:
            "O anúncio foi salvo como rascunho, mas não foi possível publicá-lo.",
          listingId,
        };
      }
    }

    const result = await getListingForOwner(userId, listingId);

    if (!result.ok || !result.data) {
      return { ok: false, error: LOAD_ERROR, listingId };
    }

    return { ok: true, data: result.data };
  } catch (error) {
    console.error("[listings] createListing", error);
    return { ok: false, error: SAVE_ERROR };
  }
}

type UpdateListingParams = {
  userId: string;
  listingId: string;
  input: ListingInput;
  images: ListingImageInput[];
  publish: boolean;
};

/**
 * Atualiza os campos e substitui o conjunto de imagens do anúncio.
 *
 * A troca de imagens acontece em uma única transação no banco (RPC), evitando
 * estados intermediários sem imagem principal. Se os campos forem salvos mas a
 * troca de imagens falhar, o anúncio continua editável e o retorno informa
 * exatamente isso com o `listingId`.
 */
export async function updateListing({
  userId,
  listingId,
  input,
  images,
  publish,
}: UpdateListingParams): Promise<ListingMutationResult<Listing>> {
  if (!isListingId(listingId)) {
    return { ok: false, error: NOT_FOUND_ERROR };
  }

  try {
    const supabase = await createClient();
    const current = await getListingForOwner(userId, listingId);

    if (!current.ok) {
      return { ok: false, error: current.error };
    }

    if (!current.data) {
      return { ok: false, error: NOT_FOUND_ERROR };
    }

    const currentPaths = current.data.images.map((image) => image.storagePath);
    const nextPaths = new Set(images.map((image) => image.storagePath));
    const removedPaths = currentPaths.filter(
      (path) => !nextPaths.has(path) && belongsToUser(path, userId),
    );

    const { error: updateError } = await supabase
      .from("products")
      .update({
        category_id: input.categoryId,
        title: input.title,
        description: input.description,
        price: input.price,
        condition: input.condition,
        city: input.city,
        neighborhood: input.neighborhood,
        ...(publish ? { status: "active" } : {}),
      })
      .eq("id", listingId)
      .eq("seller_id", userId);

    if (updateError) {
      console.error("[listings] updateListing fields", updateError);
      return { ok: false, error: SAVE_ERROR, listingId };
    }

    const { error: imageError } = await supabase.rpc("replace_product_images", {
      p_product_id: listingId,
      p_images: toRpcImages(images),
    });

    if (imageError) {
      console.error("[listings] updateListing images", imageError);
      return {
        ok: false,
        error:
          "Os dados do anúncio foram salvos, mas não foi possível atualizar as imagens. Revise as imagens e tente novamente.",
        listingId,
        field: "images",
      };
    }

    if (removedPaths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(LISTING_IMAGE_BUCKET)
        .remove(removedPaths);

      if (removeError) {
        console.error("[listings] updateListing storage cleanup", removeError);
      }
    }

    const result = await getListingForOwner(userId, listingId);

    if (!result.ok || !result.data) {
      return { ok: false, error: LOAD_ERROR, listingId };
    }

    return { ok: true, data: result.data };
  } catch (error) {
    console.error("[listings] updateListing", error);
    return { ok: false, error: SAVE_ERROR, listingId };
  }
}

/**
 * Publica um anúncio existente. Publicar exige pelo menos uma imagem para
 * evitar que o catálogo exponha cards sem conteúdo visual.
 */
export async function publishListing(
  userId: string,
  listingId: string,
): Promise<ListingMutationResult<Listing>> {
  const current = await getListingForOwner(userId, listingId);

  if (!current.ok) {
    return { ok: false, error: current.error };
  }

  if (!current.data) {
    return { ok: false, error: NOT_FOUND_ERROR };
  }

  if (current.data.images.length === 0) {
    return { ok: false, error: PUBLISH_REQUIRES_IMAGE, listingId };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ status: "active" })
      .eq("id", listingId)
      .eq("seller_id", userId);

    if (error) {
      console.error("[listings] publishListing", error);
      return { ok: false, error: PUBLISH_ERROR, listingId };
    }

    return { ok: true, data: { ...current.data, status: "active" } };
  } catch (error) {
    console.error("[listings] publishListing", error);
    return { ok: false, error: PUBLISH_ERROR, listingId };
  }
}

/**
 * Pausa um anúncio publicado sem apagar seus dados.
 */
export async function pauseListing(
  userId: string,
  listingId: string,
): Promise<ListingMutationResult<Listing>> {
  const current = await getListingForOwner(userId, listingId);

  if (!current.ok) {
    return { ok: false, error: current.error };
  }

  if (!current.data) {
    return { ok: false, error: NOT_FOUND_ERROR };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ status: "paused" })
      .eq("id", listingId)
      .eq("seller_id", userId);

    if (error) {
      console.error("[listings] pauseListing", error);
      return { ok: false, error: PUBLISH_ERROR, listingId };
    }

    return { ok: true, data: { ...current.data, status: "paused" } };
  } catch (error) {
    console.error("[listings] pauseListing", error);
    return { ok: false, error: PUBLISH_ERROR, listingId };
  }
}

/**
 * Exclui o anúncio e seus arquivos no Storage.
 *
 * A linha do banco é removida primeiro (com cascade das imagens). Se a limpeza
 * do Storage falhar, o anúncio continua excluído e o arquivo fica órfão; o
 * comportamento está documentado em `docs/architecture/listings.md`.
 */
export async function deleteListing(
  userId: string,
  listingId: string,
): Promise<ListingMutationResult<{ id: string }>> {
  const current = await getListingForOwner(userId, listingId);

  if (!current.ok) {
    return { ok: false, error: current.error };
  }

  if (!current.data) {
    return { ok: false, error: NOT_FOUND_ERROR };
  }

  const storagePaths = current.data.images
    .map((image) => image.storagePath)
    .filter((path) => belongsToUser(path, userId));

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", listingId)
      .eq("seller_id", userId);

    if (error) {
      console.error("[listings] deleteListing", error);
      return { ok: false, error: DELETE_ERROR, listingId };
    }

    if (storagePaths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(LISTING_IMAGE_BUCKET)
        .remove(storagePaths);

      if (removeError) {
        console.error("[listings] deleteListing storage cleanup", removeError);
      }
    }

    return { ok: true, data: { id: listingId } };
  } catch (error) {
    console.error("[listings] deleteListing", error);
    return { ok: false, error: DELETE_ERROR, listingId };
  }
}
