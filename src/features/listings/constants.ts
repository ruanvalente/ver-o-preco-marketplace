/**
 * Shared limits and storage configuration for the listings module.
 *
 * These values are used by client validation, server validation and the
 * browser upload service, so they live in one place instead of drifting apart.
 */

export const LISTING_TITLE_MIN_LENGTH = 3
export const LISTING_TITLE_MAX_LENGTH = 120
export const LISTING_DESCRIPTION_MAX_LENGTH = 5000
export const LISTING_NEIGHBORHOOD_MAX_LENGTH = 80
export const LISTING_PRICE_MAX = 9_999_999_999.99

export const LISTING_IMAGE_BUCKET = "product-images"
export const LISTING_IMAGE_MAX_COUNT = 8
export const LISTING_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const LISTING_IMAGE_MAX_ALT_LENGTH = 200

export const LISTING_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const

export const LISTING_IMAGE_ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
] as const

export type ListingImageMimeType =
  (typeof LISTING_IMAGE_ALLOWED_MIME_TYPES)[number]

export const LISTING_IMAGE_ACCEPT = LISTING_IMAGE_ALLOWED_MIME_TYPES.join(",")

export const LISTING_IMAGE_HELP_TEXT =
  "Até 8 imagens em JPG, PNG ou WebP, com no máximo 5 MB cada."
