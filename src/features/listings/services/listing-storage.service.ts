import { createClient } from "@/lib/supabase/client"

import {
  LISTING_IMAGE_BUCKET,
  type ListingImageMimeType,
} from "../constants"
import { validateListingImageFile } from "../schemas/listing.schemas"

const EXTENSION_BY_MIME: Record<ListingImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

const UPLOAD_ERROR = "Não foi possível enviar a imagem. Tente novamente."

export type UploadedListingImage = {
  storagePath: string
  url: string
}

export type UploadListingImageResult =
  | { ok: true; data: UploadedListingImage }
  | { ok: false; error: string }

function createRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2)
}

function resolveExtension(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase()

  if (extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "webp") {
    return extension
  }

  return EXTENSION_BY_MIME[file.type as ListingImageMimeType] ?? null
}

/**
 * Envia uma imagem do navegador para o bucket público de produtos.
 *
 * O caminho sempre começa com o id do usuário autenticado. A política de
 * Storage repete essa regra no banco, portanto um caminho forjado no cliente
 * não consegue gravar fora da própria pasta.
 */
export async function uploadListingImage(
  file: File,
  userId: string,
): Promise<UploadListingImageResult> {
  const validation = validateListingImageFile(file)

  if (!validation.ok) {
    return { ok: false, error: validation.error ?? UPLOAD_ERROR }
  }

  const extension = resolveExtension(file)

  if (!extension) {
    return {
      ok: false,
      error: "Não foi possível identificar o formato da imagem.",
    }
  }

  try {
    const supabase = createClient()
    const storagePath = `${userId}/${Date.now()}-${createRandomId()}.${extension}`

    const { data, error } = await supabase.storage
      .from(LISTING_IMAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      })

    if (error || !data) {
      console.error("[listings] uploadListingImage", error)
      return { ok: false, error: UPLOAD_ERROR }
    }

    const { data: publicUrlData } = supabase.storage
      .from(LISTING_IMAGE_BUCKET)
      .getPublicUrl(data.path)

    return {
      ok: true,
      data: {
        storagePath: data.path,
        url: publicUrlData.publicUrl,
      },
    }
  } catch (error) {
    console.error("[listings] uploadListingImage", error)
    return { ok: false, error: UPLOAD_ERROR }
  }
}

/**
 * Remove uma imagem recém-enviada que ainda não foi associada a um anúncio.
 *
 * Imagens já persistidas são removidas pelo servidor somente depois que a
 * substituição do conjunto de imagens é confirmada no banco.
 */
export async function deleteListingImage(
  storagePath: string,
): Promise<{ ok: boolean }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.storage
      .from(LISTING_IMAGE_BUCKET)
      .remove([storagePath])

    if (error) {
      console.error("[listings] deleteListingImage", error)
      return { ok: false }
    }

    return { ok: true }
  } catch (error) {
    console.error("[listings] deleteListingImage", error)
    return { ok: false }
  }
}
