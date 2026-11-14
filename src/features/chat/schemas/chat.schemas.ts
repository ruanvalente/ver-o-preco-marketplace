import {
  CHAT_IMAGE_EXTENSION_BY_MIME,
  CHAT_IMAGE_MAX_BYTES,
  CHAT_IMAGE_MIME_TYPES,
  CHAT_MESSAGE_MAX_LENGTH,
} from "../constants"
import type { ChatImageMimeType } from "../constants"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i
const IMAGE_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i

export type ChatValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export function isChatImageMimeType(value: string): value is ChatImageMimeType {
  return (CHAT_IMAGE_MIME_TYPES as readonly string[]).includes(value)
}

export function getChatImageExtension(
  mimeType: string,
): "jpg" | "png" | "webp" | null {
  return isChatImageMimeType(mimeType)
    ? CHAT_IMAGE_EXTENSION_BY_MIME[mimeType]
    : null
}

export function isConversationId(value: string): boolean {
  return UUID_PATTERN.test(value)
}

export function isChatCursorTimestamp(value: string): boolean {
  return (
    ISO_TIMESTAMP_PATTERN.test(value) &&
    Number.isFinite(Date.parse(value))
  )
}

export function validateProductId(value: unknown): ChatValidationResult<string> {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    return { ok: false, error: "Este anúncio não está disponível para conversa." }
  }

  return { ok: true, data: value }
}

export function validateMessageText(
  value: unknown,
): ChatValidationResult<string> {
  if (typeof value !== "string") {
    return { ok: false, error: "Digite uma mensagem antes de enviar." }
  }

  const content = value.trim()

  if (!content) {
    return { ok: false, error: "Digite uma mensagem antes de enviar." }
  }

  if (content.length > CHAT_MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      error: `A mensagem deve ter no máximo ${CHAT_MESSAGE_MAX_LENGTH} caracteres.`,
    }
  }

  return { ok: true, data: content }
}

export function validateChatImageFile(
  file: Pick<File, "type" | "size">,
): ChatValidationResult<null> {
  if (!isChatImageMimeType(file.type)) {
    return {
      ok: false,
      error: "Formato não suportado. Use uma imagem JPG, PNG ou WebP.",
    }
  }

  if (file.size <= 0) {
    return { ok: false, error: "O arquivo de imagem está vazio." }
  }

  if (file.size > CHAT_IMAGE_MAX_BYTES) {
    return { ok: false, error: "A imagem deve ter no máximo 5 MB." }
  }

  return { ok: true, data: null }
}

export function validateChatAttachmentPath(
  path: unknown,
  conversationId: string,
  userId: string,
): ChatValidationResult<string> {
  if (typeof path !== "string" || path.length > 512) {
    return { ok: false, error: "A imagem enviada não é válida." }
  }

  const [pathConversationId, pathUserId, filename, ...extra] = path.split("/")

  if (
    extra.length > 0 ||
    pathConversationId !== conversationId ||
    pathUserId !== userId ||
    !IMAGE_FILENAME_PATTERN.test(filename ?? "")
  ) {
    return { ok: false, error: "A imagem enviada não é válida." }
  }

  return { ok: true, data: path }
}
