import { isParaMunicipality } from "@/features/auth/data/para-municipalities"
import {
  PRODUCT_CONDITIONS,
  type ProductCondition,
} from "@/features/products/types/product.types"

import {
  LISTING_DESCRIPTION_MAX_LENGTH,
  LISTING_IMAGE_ALLOWED_EXTENSIONS,
  LISTING_IMAGE_ALLOWED_MIME_TYPES,
  LISTING_IMAGE_MAX_ALT_LENGTH,
  LISTING_IMAGE_MAX_BYTES,
  LISTING_IMAGE_MAX_COUNT,
  LISTING_NEIGHBORHOOD_MAX_LENGTH,
  LISTING_PRICE_MAX,
  LISTING_TITLE_MAX_LENGTH,
  LISTING_TITLE_MIN_LENGTH,
  type ListingImageMimeType,
} from "../constants"
import {
  LISTING_FORM_INTENTS,
  type ListingFormData,
  type ListingFormIntent,
  type ListingImageInput,
} from "../types/listing.types"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type ListingValidationResult =
  | { ok: true; data: ListingFormData }
  | { ok: false; errors: Record<string, string> }

export type ListingImageFileValidation = {
  ok: boolean
  error?: string
}

function readField(formData: FormData, field: string): string {
  const value = formData.get(field)
  return typeof value === "string" ? value : ""
}

function isProductCondition(value: string): value is ProductCondition {
  return (PRODUCT_CONDITIONS as readonly string[]).includes(value)
}

function isListingFormIntent(value: string): value is ListingFormIntent {
  return (LISTING_FORM_INTENTS as readonly string[]).includes(value)
}

export function isListingId(value: string): boolean {
  return UUID_PATTERN.test(value)
}

export function isListingImageMimeType(
  value: string,
): value is ListingImageMimeType {
  return (LISTING_IMAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(value)
}

/**
 * Parses prices typed with Brazilian or decimal-dot notation.
 *
 * `1.500` is read as one thousand five hundred, while `1500,50` and `1500.50`
 * both become 1500.5. The result is rounded to cents because the database uses
 * `numeric(12, 2)`.
 */
export function parseListingPrice(value: string): number | null {
  const cleaned = value.replace(/[^\d,.-]/g, "").trim()

  if (!cleaned) {
    return null
  }

  let normalized = cleaned

  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".")
  } else {
    const parts = cleaned.split(".")

    if (parts.length > 2) {
      normalized = cleaned.replace(/\./g, "")
    } else if (parts.length === 2 && parts[1].length === 3) {
      normalized = cleaned.replace(".", "")
    }
  }

  const parsed = Number(normalized)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return Math.round(parsed * 100) / 100
}

export function validateListingImageFile(
  file: File,
): ListingImageFileValidation {
  if (!isListingImageMimeType(file.type)) {
    return {
      ok: false,
      error: "Formato não suportado. Use JPG, PNG ou WebP.",
    }
  }

  if (file.size <= 0) {
    return { ok: false, error: "O arquivo de imagem está vazio." }
  }

  if (file.size > LISTING_IMAGE_MAX_BYTES) {
    return { ok: false, error: "A imagem deve ter no máximo 5 MB." }
  }

  return { ok: true }
}

export function isListingImageExtensionAllowed(path: string): boolean {
  const extension = path.split(".").pop()?.toLowerCase()

  return Boolean(
    extension &&
      (LISTING_IMAGE_ALLOWED_EXTENSIONS as readonly string[]).includes(
        extension,
      ),
  )
}

function parseImages(rawValue: string): ListingImageInput[] | string {
  if (!rawValue.trim()) {
    return []
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(rawValue)
  } catch {
    return "Não foi possível ler as imagens do anúncio."
  }

  if (!Array.isArray(parsed)) {
    return "Não foi possível ler as imagens do anúncio."
  }

  if (parsed.length > LISTING_IMAGE_MAX_COUNT) {
    return `Você pode adicionar no máximo ${LISTING_IMAGE_MAX_COUNT} imagens.`
  }

  const images: ListingImageInput[] = []
  const seenPaths = new Set<string>()
  let primaryIndex = -1

  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      return "Uma das imagens enviadas é inválida."
    }

    const candidate = item as Record<string, unknown>
    const storagePath =
      typeof candidate.storagePath === "string"
        ? candidate.storagePath.trim()
        : ""

    if (!storagePath || storagePath.length > 512) {
      return "Uma das imagens enviadas é inválida."
    }

    if (seenPaths.has(storagePath)) {
      return "Uma imagem foi enviada mais de uma vez."
    }

    seenPaths.add(storagePath)

    const altText =
      typeof candidate.altText === "string" && candidate.altText.trim()
        ? candidate.altText.trim().slice(0, LISTING_IMAGE_MAX_ALT_LENGTH)
        : null

    const sortOrder =
      typeof candidate.sortOrder === "number" &&
      Number.isInteger(candidate.sortOrder) &&
      candidate.sortOrder >= 0
        ? candidate.sortOrder
        : images.length

    const isPrimary = candidate.isPrimary === true

    if (isPrimary && primaryIndex === -1) {
      primaryIndex = images.length
    }

    images.push({
      storagePath,
      altText,
      sortOrder,
      isPrimary: false,
    })
  }

  if (images.length > 0) {
    if (primaryIndex === -1) {
      primaryIndex = 0
    }

    images[primaryIndex] = { ...images[primaryIndex], isPrimary: true }
  }

  return images
}

function parseRemovedImagePaths(rawValue: string): string[] | string {
  if (!rawValue.trim()) {
    return []
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(rawValue)
  } catch {
    return "Não foi possível ler as imagens removidas."
  }

  if (!Array.isArray(parsed)) {
    return "Não foi possível ler as imagens removidas."
  }

  const paths = parsed.filter(
    (path): path is string => typeof path === "string" && path.length > 0,
  )

  if (paths.length !== parsed.length) {
    return "Não foi possível ler as imagens removidas."
  }

  return Array.from(new Set(paths))
}

/**
 * Validates the listing form on both client and server.
 *
 * The server never trusts `seller_id` or `status`: the action derives both from
 * the session and from the explicit intent validated here.
 */
export function validateListingForm(
  formData: FormData,
): ListingValidationResult {
  const errors: Record<string, string> = {}

  const listingId = readField(formData, "listingId").trim()
  const rawIntent = readField(formData, "intent").trim()

  if (listingId && !isListingId(listingId)) {
    errors.form = "Anúncio inválido."
  }

  if (!isListingFormIntent(rawIntent)) {
    errors.form = "Selecione uma ação válida."
  } else if (listingId && rawIntent === "draft") {
    errors.form = "Ação inválida para um anúncio existente."
  } else if (!listingId && rawIntent === "save") {
    errors.form = "Ação inválida para um novo anúncio."
  }

  const intent: ListingFormIntent = isListingFormIntent(rawIntent)
    ? rawIntent
    : "draft"

  const title = readField(formData, "title").trim()

  if (!title) {
    errors.title = "Informe o título do anúncio."
  } else if (title.length < LISTING_TITLE_MIN_LENGTH) {
    errors.title = `O título deve ter pelo menos ${LISTING_TITLE_MIN_LENGTH} caracteres.`
  } else if (title.length > LISTING_TITLE_MAX_LENGTH) {
    errors.title = `O título deve ter no máximo ${LISTING_TITLE_MAX_LENGTH} caracteres.`
  }

  const description = readField(formData, "description").trim()

  if (description.length > LISTING_DESCRIPTION_MAX_LENGTH) {
    errors.description = `A descrição deve ter no máximo ${LISTING_DESCRIPTION_MAX_LENGTH} caracteres.`
  }

  const categoryId = readField(formData, "categoryId").trim()

  if (!categoryId) {
    errors.categoryId = "Selecione uma categoria."
  } else if (!isListingId(categoryId)) {
    errors.categoryId = "Selecione uma categoria válida."
  }

  const rawCondition = readField(formData, "condition").trim()

  if (!rawCondition) {
    errors.condition = "Selecione a condição do produto."
  } else if (!isProductCondition(rawCondition)) {
    errors.condition = "Selecione uma condição válida."
  }

  const rawPrice = readField(formData, "price").trim()
  const price = parseListingPrice(rawPrice)

  if (!rawPrice) {
    errors.price = "Informe o preço do anúncio."
  } else if (price === null) {
    errors.price = "Informe um preço válido."
  } else if (price > LISTING_PRICE_MAX) {
    errors.price = "O preço informado é muito alto."
  }

  const city = readField(formData, "city").trim()

  if (!city) {
    errors.city = "Selecione o município do anúncio."
  } else if (!isParaMunicipality(city)) {
    errors.city = "Selecione um município do Pará."
  }

  const neighborhood = readField(formData, "neighborhood").trim()

  if (neighborhood.length > LISTING_NEIGHBORHOOD_MAX_LENGTH) {
    errors.neighborhood = `O bairro deve ter no máximo ${LISTING_NEIGHBORHOOD_MAX_LENGTH} caracteres.`
  }

  const imagesResult = parseImages(readField(formData, "images"))

  if (typeof imagesResult === "string") {
    errors.images = imagesResult
  }

  const removedPathsResult = parseRemovedImagePaths(
    readField(formData, "removedImagePaths"),
  )

  if (typeof removedPathsResult === "string") {
    errors.form = removedPathsResult
  }

  const images = typeof imagesResult === "string" ? [] : imagesResult
  const removedImagePaths =
    typeof removedPathsResult === "string" ? [] : removedPathsResult

  if (intent === "publish" && images.length === 0) {
    errors.images = "Adicione pelo menos uma imagem para publicar o anúncio."
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      listingId: listingId || undefined,
      intent,
      input: {
        title,
        description,
        categoryId,
        price: price as number,
        condition: rawCondition as ProductCondition,
        city,
        neighborhood: neighborhood || null,
      },
      images,
      removedImagePaths,
    },
  }
}
