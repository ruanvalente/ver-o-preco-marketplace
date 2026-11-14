"use client";

import { createClient } from "@/lib/supabase/client";

import { CHAT_IMAGE_BUCKET, CHAT_SIGNED_URL_TTL_SECONDS } from "../constants";
import {
  getChatImageExtension,
  parseChatImageConversationId,
  validateChatImageFile,
} from "../schemas/chat.schemas";

export type ChatStorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const IMAGE_READ_ERROR = "Esta imagem não está disponível.";
const IMAGE_DELETE_ERROR = "Não foi possível remover a imagem enviada.";

function createFileId(): string {
  return crypto.randomUUID();
}

async function isConversationParticipant(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_conversation_participant", {
    p_conversation_id: conversationId,
  });

  if (error) {
    console.error("[chat] is_conversation_participant", error);
    return false;
  }

  return data === true;
}

export async function uploadChatImage(
  conversationId: string,
  userId: string,
  file: File,
): Promise<ChatStorageResult<string>> {
  const validation = validateChatImageFile(file);

  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const extension = getChatImageExtension(file.type);

  if (!extension) {
    return {
      ok: false,
      error: "Não foi possível identificar o formato da imagem.",
    };
  }

  const storagePath = `${conversationId}/${userId}/${createFileId()}.${extension}`;
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(CHAT_IMAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error || !data) {
    console.error("[chat] uploadChatImage", error);
    return {
      ok: false,
      error: "Não foi possível enviar a imagem. Tente novamente.",
    };
  }

  return { ok: true, data: data.path };
}

export async function getChatImageUrl(
  storagePath: string,
): Promise<ChatStorageResult<string>> {
  const conversationId = parseChatImageConversationId(storagePath);
  const supabase = createClient();

  if (
    !conversationId ||
    !(await isConversationParticipant(supabase, conversationId))
  ) {
    return { ok: false, error: IMAGE_READ_ERROR };
  }

  const { data, error } = await supabase.storage
    .from(CHAT_IMAGE_BUCKET)
    .createSignedUrl(storagePath, CHAT_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[chat] getChatImageUrl", error);
    return { ok: false, error: IMAGE_READ_ERROR };
  }

  return { ok: true, data: data.signedUrl };
}

export async function deleteChatImage(
  storagePath: string,
): Promise<ChatStorageResult<null>> {
  const conversationId = parseChatImageConversationId(storagePath);
  const supabase = createClient();

  if (
    !conversationId ||
    !(await isConversationParticipant(supabase, conversationId))
  ) {
    return { ok: false, error: IMAGE_DELETE_ERROR };
  }

  const { error } = await supabase.storage
    .from(CHAT_IMAGE_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error("[chat] deleteChatImage", error);
    return { ok: false, error: IMAGE_DELETE_ERROR };
  }

  return { ok: true, data: null };
}
