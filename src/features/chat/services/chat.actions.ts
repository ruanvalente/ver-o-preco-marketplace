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
  getConversationMessages,
  markConversationMessagesRead,
  sendChatMessage,
  startOrGetConversation,
} from "./chat.service"

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
    return { ok: false, error: "Esta conversa não está disponível." }
  }

  const validation = validateMessageText(value)

  if (!validation.ok) {
    return { ok: false, error: validation.error }
  }

  const user = await requireUser(`/messages/${conversationId}`)

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
    return { ok: false, error: "Esta conversa não está disponível." }
  }

  const user = await requireUser(`/messages/${conversationId}`)
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
  return getConversationMessages(conversationId, before)
}

export async function markChatMessagesReadAction(
  conversationId: string,
): Promise<ChatActionResult<null>> {
  if (!isConversationId(conversationId)) {
    return { ok: false, error: "Esta conversa não está disponível." }
  }

  const user = await requireUser(`/messages/${conversationId}`)
  return markConversationMessagesRead(conversationId, user.id)
}
