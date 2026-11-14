import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import { LISTING_IMAGE_BUCKET } from "../constants";
import { isListingId } from "../schemas/listing.schemas";
import type {
  Listing,
  ListingImageInput,
  ListingInput,
  ListingMutationResult,
  OwnerListingDashboard,
  OwnerListingFilters,
  OwnerListingStatusFilter,
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

function sanitizeListingSearch(value: string): string {
  return value
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .slice(0, 100)
}

async function getOwnerStatusCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  status?: Exclude<OwnerListingStatusFilter, "all"> | "draft",
): Promise<{ count: number | null; error: unknown }> {
  let query = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", userId)
    .neq("status", "removed");

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;
  return { count, error };
}

/**
 * Loads exact owner status counts and one filtered page for the seller
 * dashboard. RLS and the explicit seller filter both scope the data.
 */
export async function getOwnerListingDashboard(
  userId: string,
  filters: OwnerListingFilters,
): Promise<ListingServiceResult<OwnerListingDashboard>> {
  try {
    const supabase = await createClient();
    const search = sanitizeListingSearch(filters.query);
    const categoryIds: string[] = [];

    if (search) {
      const { data, error } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", `%${search}%`)
        .limit(100);

      if (error) {
        return failure("getOwnerListingDashboard categories", error);
      }

      categoryIds.push(...(data ?? []).map((category) => category.id));
    }

    const [allCount, draftCount, activeCount, pausedCount, soldCount] =
      await Promise.all([
        getOwnerStatusCount(supabase, userId),
        getOwnerStatusCount(supabase, userId, "draft"),
        getOwnerStatusCount(supabase, userId, "active"),
        getOwnerStatusCount(supabase, userId, "paused"),
        getOwnerStatusCount(supabase, userId, "sold"),
      ]);

    const failedCount = [
      allCount,
      draftCount,
      activeCount,
      pausedCount,
      soldCount,
    ].find((result) => result.error);

    if (failedCount) {
      return failure("getOwnerListingDashboard counts", failedCount.error);
    }

    const makeListingQuery = () => {
      let query = supabase
        .from("products")
        .select(LISTING_SELECT, { count: "exact" })
        .eq("seller_id", userId)
        .neq("status", "removed");

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (search) {
        const conditions = [
          `title.ilike.%${search}%`,
          `city.ilike.%${search}%`,
          `neighborhood.ilike.%${search}%`,
          ...categoryIds.map((id) => `category_id.eq.${id}`),
        ];
        query = query.or(conditions.join(","));
      }

      if (filters.sort === "price_asc") {
        return query
          .order("price", { ascending: true })
          .order("created_at", { ascending: false });
      }

      if (filters.sort === "price_desc") {
        return query
          .order("price", { ascending: false })
          .order("created_at", { ascending: false });
      }

      return query.order("created_at", { ascending: false });
    };

    const pageSize = Math.min(Math.max(filters.pageSize, 1), 24);
    const requestedPage = Math.max(filters.page, 1);
    const firstResult = await makeListingQuery().range(
      (requestedPage - 1) * pageSize,
      requestedPage * pageSize - 1,
    );

    if (firstResult.error) {
      return failure("getOwnerListingDashboard listings", firstResult.error);
    }

    const total = firstResult.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const pageResult =
      page === requestedPage
        ? firstResult
        : await makeListingQuery().range(
            (page - 1) * pageSize,
            page * pageSize - 1,
          );

    if (pageResult.error) {
      return failure("getOwnerListingDashboard page", pageResult.error);
    }

    const mapperOptions = createMapperOptions(supabase);

    return {
      ok: true,
      data: {
        counts: {
          all: allCount.count ?? 0,
          draft: draftCount.count ?? 0,
          active: activeCount.count ?? 0,
          paused: pausedCount.count ?? 0,
          sold: soldCount.count ?? 0,
        },
        page: {
          items: ((pageResult.data ?? []) as unknown as ListingRow[]).map(
            (row) => mapListingSummary(row, mapperOptions),
          ),
          total,
          page,
          pageSize,
          totalPages,
        },
      },
    };
  } catch (error) {
    return failure("getOwnerListingDashboard", error);
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
