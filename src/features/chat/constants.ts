export const CHAT_IMAGE_BUCKET = "chat-images"
export const CHAT_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const CHAT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const
export const CHAT_IMAGE_ACCEPT = CHAT_IMAGE_MIME_TYPES.join(",")
export const CHAT_MESSAGE_MAX_LENGTH = 2000
export const CHAT_CONVERSATION_PAGE_SIZE = 50
export const CHAT_MESSAGE_PAGE_SIZE = 30
export const CHAT_SIGNED_URL_TTL_SECONDS = 60 * 60

export type ChatImageMimeType = (typeof CHAT_IMAGE_MIME_TYPES)[number]

export const CHAT_IMAGE_EXTENSION_BY_MIME: Record<
  ChatImageMimeType,
  "jpg" | "png" | "webp"
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}
