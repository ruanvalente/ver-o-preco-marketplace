"use client"

import { createClient } from "@/lib/supabase/client"

import {
  CHAT_IMAGE_BUCKET,
  CHAT_SIGNED_URL_TTL_SECONDS,
} from "../constants"
import {
  getChatImageExtension,
  validateChatImageFile,
} from "../schemas/chat.schemas"

export type ChatStorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

function createFileId(): string {
  return crypto.randomUUID()
}

export async function uploadChatImage(
  conversationId: string,
  userId: string,
  file: File,
): Promise<ChatStorageResult<string>> {
  const validation = validateChatImageFile(file)

  if (!validation.ok) {
    return { ok: false, error: validation.error }
  }

  const extension = getChatImageExtension(file.type)

  if (!extension) {
    return { ok: false, error: "Não foi possível identificar o formato da imagem." }
  }

  const storagePath = `${conversationId}/${userId}/${createFileId()}.${extension}`
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(CHAT_IMAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    })

  if (error || !data) {
    console.error("[chat] uploadChatImage", error)
    return { ok: false, error: "Não foi possível enviar a imagem. Tente novamente." }
  }

  return { ok: true, data: data.path }
}

export async function getChatImageUrl(
  storagePath: string,
): Promise<ChatStorageResult<string>> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(CHAT_IMAGE_BUCKET)
    .createSignedUrl(storagePath, CHAT_SIGNED_URL_TTL_SECONDS)

  if (error || !data?.signedUrl) {
    console.error("[chat] getChatImageUrl", error)
    return { ok: false, error: "Não foi possível abrir esta imagem." }
  }

  return { ok: true, data: data.signedUrl }
}

export async function deleteChatImage(
  storagePath: string,
): Promise<ChatStorageResult<null>> {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(CHAT_IMAGE_BUCKET)
    .remove([storagePath])

  if (error) {
    console.error("[chat] deleteChatImage", error)
    return { ok: false, error: "Não foi possível remover a imagem enviada." }
  }

  return { ok: true, data: null }
}
