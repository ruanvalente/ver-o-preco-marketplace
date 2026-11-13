import { createClient } from "@/lib/supabase/server"

import {
  LISTING_IMAGE_BUCKET,
  LISTING_IMAGE_MAX_ALT_LENGTH,
  LISTING_IMAGE_MAX_BYTES,
  LISTING_IMAGE_MAX_COUNT,
} from "../constants"
import {
  isListingImageExtensionAllowed,
  isListingImageMimeType,
} from "../schemas/listing.schemas"
import type {
  ListingImageInput,
  ListingServiceResult,
} from "../types/listing.types"

const INVALID_IMAGE_ERROR = "Uma das imagens enviadas é inválida."
const MISSING_IMAGE_ERROR =
  "Uma das imagens enviadas não foi encontrada. Remova-a e envie novamente."
const INVALID_IMAGE_FILE_ERROR =
  "Uma das imagens enviadas não é um arquivo JPG, PNG ou WebP válido de até 5 MB."

/**
 * Valida as imagens no servidor antes de associá-las a um anúncio.
 *
 * O cliente envia apenas caminhos do Storage. O servidor confirma que:
 * - o caminho pertence à pasta do usuário autenticado;
 * - a extensão e o content-type são permitidos;
 * - o objeto existe e respeita o limite de tamanho;
 * - a lista tem no máximo 8 imagens e exatamente uma principal.
 *
 * Assim, mesmo uma chamada manual ao Server Action não consegue associar
 * arquivos de outro usuário nem arquivos que não sejam imagens válidas.
 */
export async function validateListingImagesForUser(
  userId: string,
  images: ListingImageInput[],
): Promise<ListingServiceResult<ListingImageInput[]>> {
  if (images.length === 0) {
    return { ok: true, data: [] }
  }

  if (images.length > LISTING_IMAGE_MAX_COUNT) {
    return {
      ok: false,
      error: `Você pode adicionar no máximo ${LISTING_IMAGE_MAX_COUNT} imagens.`,
    }
  }

  try {
    const supabase = await createClient()
    const seenPaths = new Set<string>()
    const normalized: ListingImageInput[] = []
    let primaryIndex = images.findIndex((image) => image.isPrimary)

    if (primaryIndex === -1) {
      primaryIndex = 0
    }

    for (const [index, image] of images.entries()) {
      const storagePath = image.storagePath.trim()

      if (
        !storagePath ||
        storagePath.length > 512 ||
        storagePath.includes("..") ||
        !storagePath.startsWith(`${userId}/`) ||
        !isListingImageExtensionAllowed(storagePath)
      ) {
        return { ok: false, error: INVALID_IMAGE_ERROR }
      }

      if (seenPaths.has(storagePath)) {
        return { ok: false, error: INVALID_IMAGE_ERROR }
      }

      seenPaths.add(storagePath)

      const { data, error } = await supabase.storage
        .from(LISTING_IMAGE_BUCKET)
        .info(storagePath)

      if (error || !data) {
        return { ok: false, error: MISSING_IMAGE_ERROR }
      }

      const contentType = data.contentType ?? ""
      const size = data.size ?? 0

      if (
        !isListingImageMimeType(contentType) ||
        size <= 0 ||
        size > LISTING_IMAGE_MAX_BYTES
      ) {
        return { ok: false, error: INVALID_IMAGE_FILE_ERROR }
      }

      const altText = image.altText?.trim().slice(0, LISTING_IMAGE_MAX_ALT_LENGTH)

      normalized.push({
        storagePath,
        altText: altText || null,
        sortOrder: index,
        isPrimary: index === primaryIndex,
      })
    }

    return { ok: true, data: normalized }
  } catch (error) {
    console.error("[listings] validateListingImagesForUser", error)
    return { ok: false, error: INVALID_IMAGE_ERROR }
  }
}
