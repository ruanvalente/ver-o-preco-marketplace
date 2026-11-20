"use server"

import { redirect } from "next/navigation"

import { requireUser } from "@/features/auth/services/session.service"

import {
  isConversationId,
  isChatCursorTimestamp,
  validateChatAttachmentPath,
  validateMessageText,
  validateProductId,
} from "../schemas/chat.schemas"
import type {
  ChatActionResult,
  ChatActionState,
  ChatMessage,
  ChatMessagePage,
} from "../types/chat.types"
import {
  checkConversationParticipation,
  getConversationMessages,
  markConversationMessagesRead,
  sendChatMessage,
  startOrGetConversation,
} from "./chat.service"

const CONVERSATION_UNAVAILABLE_ERROR = "Esta conversa não está disponível."
const PARTICIPATION_CHECK_ERROR =
  "Não foi possível verificar esta conversa. Tente novamente."

async function participationErrorFor(
  conversationId: string,
): Promise<string | null> {
  const participation = await checkConversationParticipation(conversationId)

  if (participation.ok) {
    return null
  }

  return participation.reason === "unavailable"
    ? PARTICIPATION_CHECK_ERROR
    : CONVERSATION_UNAVAILABLE_ERROR
}

export async function startConversationAction(
  _previousState: ChatActionState,
  formData: FormData,
): Promise<ChatActionState> {
  const validation = validateProductId(formData.get("productId"))

  if (!validation.ok) {
    return { status: "error", message: validation.error }
  }

  await requireUser(`/products/${validation.data}`)
  const result = await startOrGetConversation(validation.data)

  if (!result.ok) {
    return { status: "error", message: result.error }
  }

  redirect(`/messages/${result.data}`)
}

export async function sendChatTextAction(
  conversationId: string,
  value: string,
): Promise<ChatActionResult<ChatMessage>> {
  if (!isConversationId(conversationId)) {
    return { ok: false, error: CONVERSATION_UNAVAILABLE_ERROR }
  }

  const validation = validateMessageText(value)

  if (!validation.ok) {
    return { ok: false, error: validation.error }
  }

  const user = await requireUser(`/messages/${conversationId}`)

  const participationError = await participationErrorFor(conversationId)

  if (participationError) {
    return { ok: false, error: participationError }
  }

  return sendChatMessage({
    conversationId,
    senderId: user.id,
    type: "text",
    content: validation.data,
    attachmentPath: null,
  })
}

export async function sendChatImageAction(
  conversationId: string,
  attachmentPath: string,
): Promise<ChatActionResult<ChatMessage>> {
  if (!isConversationId(conversationId)) {
    return { ok: false, error: CONVERSATION_UNAVAILABLE_ERROR }
  }

  const user = await requireUser(`/messages/${conversationId}`)

  const participationError = await participationErrorFor(conversationId)

  if (participationError) {
    return { ok: false, error: participationError }
  }

  const validation = validateChatAttachmentPath(
    attachmentPath,
    conversationId,
    user.id,
  )

  if (!validation.ok) {
    return { ok: false, error: validation.error }
  }

  return sendChatMessage({
    conversationId,
    senderId: user.id,
    type: "image",
    content: null,
    attachmentPath: validation.data,
  })
}

export async function loadOlderChatMessagesAction(
  conversationId: string,
  before: { createdAt: string; id: string },
): Promise<ChatActionResult<ChatMessagePage>> {
  if (
    !isConversationId(conversationId) ||
    !before ||
    !isConversationId(before.id) ||
    !isChatCursorTimestamp(before.createdAt)
  ) {
    return { ok: false, error: "Não foi possível carregar mensagens anteriores." }
  }

  await requireUser(`/messages/${conversationId}`)

  const participationError = await participationErrorFor(conversationId)

  if (participationError) {
    return { ok: false, error: participationError }
  }

  return getConversationMessages(conversationId, before)
}

export async function markChatMessagesReadAction(
  conversationId: string,
): Promise<ChatActionResult<null>> {
  if (!isConversationId(conversationId)) {
    return { ok: false, error: CONVERSATION_UNAVAILABLE_ERROR }
  }

  const user = await requireUser(`/messages/${conversationId}`)

  const participationError = await participationErrorFor(conversationId)

  if (participationError) {
    return { ok: false, error: participationError }
  }

  return markConversationMessagesRead(conversationId, user.id)
}
