import { createClient } from "@/lib/supabase/server"

import {
  CHAT_CONVERSATION_PAGE_SIZE,
  CHAT_IMAGE_BUCKET,
  CHAT_MESSAGE_PAGE_SIZE,
  CHAT_SIGNED_URL_TTL_SECONDS,
} from "../constants"
import type {
  ChatConversation,
  ChatMessage,
  ChatMessagePage,
  ChatParticipant,
  ConversationDetails,
} from "../types/chat.types"
import {
  isChatCursorTimestamp,
  isConversationId,
} from "../schemas/chat.schemas"

const CHAT_LOAD_ERROR = "Não foi possível carregar suas conversas."
const MESSAGE_LOAD_ERROR = "Não foi possível carregar as mensagens."
const MESSAGE_SAVE_ERROR = "Não foi possível enviar a mensagem. Tente novamente."
const CONVERSATION_START_ERROR =
  "Não foi possível iniciar uma conversa para este anúncio."
const READ_STATE_ERROR = "Não foi possível atualizar o status de leitura."

type ChatConversationRow = {
  conversation_id: string
  product_id: string
  product_title: string
  product_price: number | string
  product_city: string
  product_neighborhood: string | null
  product_image_path: string | null
  other_user_id: string
  other_display_name: string | null
  other_avatar_path: string | null
  last_message_id: string | null
  last_message_type: string | null
  last_message_content: string | null
  last_message_sender_id: string | null
  last_message_created_at: string | null
  unread_count: number | string
  updated_at: string
}

type Relation<T> = T | T[] | null

type ConversationRow = {
  id: string
  buyer_id: string
  seller_id: string
  product: Relation<{
    id: string
    title: string
    price: number | string
    city: string
    neighborhood: string | null
    images: Array<{ storage_path: string; is_primary: boolean; sort_order: number }> | null
  }>
  buyer: Relation<{ id: string; display_name: string | null; avatar_path: string | null }>
  seller: Relation<{ id: string; display_name: string | null; avatar_path: string | null }>
}

type MessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  message_type: string
  content: string | null
  attachment_path: string | null
  created_at: string
  read_at: string | null
}

function firstRelation<T>(value: Relation<T>): T | null {
  return Array.isArray(value) ? value[0] ?? null : value
}

function getPublicImageUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: string,
  path: string | null,
): string | null {
  if (!path) {
    return null
  }

  if (path.startsWith("/") || path.startsWith("http")) {
    return path
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

function mapParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: { id: string; display_name: string | null; avatar_path: string | null },
): ChatParticipant {
  return {
    id: row.id,
    displayName: row.display_name?.trim() || "Pessoa usuária",
    avatarUrl: getPublicImageUrl(supabase, "avatars", row.avatar_path),
  }
}

function mapConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: ChatConversationRow,
): ChatConversation {
  const lastMessageType: ChatMessage["type"] =
    row.last_message_type === "image" ? "image" : "text"
  const lastMessage =
    row.last_message_id && row.last_message_created_at
      ? {
          id: row.last_message_id,
          type: lastMessageType,
          content: row.last_message_content,
          senderId: row.last_message_sender_id ?? "",
          createdAt: row.last_message_created_at,
        }
      : null

  return {
    id: row.conversation_id,
    participant: {
      id: row.other_user_id,
      displayName: row.other_display_name?.trim() || "Pessoa usuária",
      avatarUrl: getPublicImageUrl(supabase, "avatars", row.other_avatar_path),
    },
    product: {
      id: row.product_id,
      title: row.product_title,
      price: Number(row.product_price),
      location: row.product_neighborhood
        ? `${row.product_city} - ${row.product_neighborhood}`
        : row.product_city,
      imageUrl: getPublicImageUrl(
        supabase,
        "product-images",
        row.product_image_path,
      ),
    },
    lastMessage,
    unreadCount: Number(row.unread_count),
    updatedAt: row.updated_at,
  }
}

function mapConversationDetails(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: ConversationRow,
  userId: string,
): ConversationDetails | null {
  const product = firstRelation(row.product)
  const otherParticipant = firstRelation(
    row.buyer_id === userId ? row.seller : row.buyer,
  )

  if (!product || !otherParticipant) {
    return null
  }

  const images = (product.images ?? []).slice().sort((left, right) => {
    if (left.is_primary !== right.is_primary) {
      return left.is_primary ? -1 : 1
    }

    return left.sort_order - right.sort_order
  })

  return {
    id: row.id,
    participant: mapParticipant(supabase, otherParticipant),
    product: {
      id: product.id,
      title: product.title,
      price: Number(product.price),
      location: product.neighborhood
        ? `${product.city} - ${product.neighborhood}`
        : product.city,
      imageUrl: getPublicImageUrl(
        supabase,
        "product-images",
        images[0]?.storage_path ?? null,
      ),
    },
  }
}

function mapMessage(row: MessageRow, imageUrl: string | null = null): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    type: row.message_type === "image" ? "image" : "text",
    content: row.content,
    attachmentPath: row.attachment_path,
    imageUrl,
    createdAt: row.created_at,
    readAt: row.read_at,
  }
}

async function addSignedImageUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  messages: MessageRow[],
): Promise<ChatMessage[]> {
  const paths = [
    ...new Set(
      messages
        .map((message) => message.attachment_path)
        .filter((path): path is string => Boolean(path)),
    ),
  ]
  const imageUrls = new Map<string, string>()

  if (paths.length > 0) {
    const { data, error } = await supabase.storage
      .from(CHAT_IMAGE_BUCKET)
      .createSignedUrls(paths, CHAT_SIGNED_URL_TTL_SECONDS)

    if (error) {
      console.error("[chat] createSignedUrls", error)
    } else {
      for (const signedUrl of data ?? []) {
        if (signedUrl.path && signedUrl.signedUrl) {
          imageUrls.set(signedUrl.path, signedUrl.signedUrl)
        } else if (signedUrl.path && signedUrl.error) {
          console.error("[chat] createSignedUrls", signedUrl.error)
        }
      }
    }
  }

  return messages.map((message) =>
    mapMessage(
      message,
      message.attachment_path
        ? imageUrls.get(message.attachment_path) ?? null
        : null,
    ),
  )
}

export type ChatServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export type SellerChatMetrics = {
  conversationCount: number
  receivedMessageCount: number
  unreadMessageCount: number
}

export async function getChatConversations(
  limit = CHAT_CONVERSATION_PAGE_SIZE,
  offset = 0,
): Promise<ChatServiceResult<ChatConversation[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_chat_conversations", {
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    console.error("[chat] getChatConversations", error)
    return { ok: false, error: CHAT_LOAD_ERROR }
  }

  return {
    ok: true,
    data: ((data ?? []) as unknown as ChatConversationRow[]).map((row) =>
      mapConversation(supabase, row),
    ),
  }
}

/**
 * Counts seller-side chat activity without returning message contents.
 * The session's RLS policies remain in force alongside the explicit owner
 * filter.
 */
export async function getSellerChatMetrics(
  sellerId: string,
): Promise<ChatServiceResult<SellerChatMetrics>> {
  try {
    const supabase = await createClient()
    const [conversations, receivedMessages, unreadMessages] =
      await Promise.all([
        supabase
          .from("conversations")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", sellerId),
        supabase
          .from("messages")
          .select("id, conversations!inner(seller_id)", {
            count: "exact",
            head: true,
          })
          .eq("conversations.seller_id", sellerId)
          .neq("sender_id", sellerId),
        supabase
          .from("messages")
          .select("id, conversations!inner(seller_id)", {
            count: "exact",
            head: true,
          })
          .eq("conversations.seller_id", sellerId)
          .neq("sender_id", sellerId)
          .is("read_at", null),
      ])

    const failedResult = [conversations, receivedMessages, unreadMessages].find(
      (result) => result.error,
    )

    if (failedResult?.error) {
      console.error("[chat] getSellerChatMetrics", failedResult.error)
      return { ok: false, error: CHAT_LOAD_ERROR }
    }

    return {
      ok: true,
      data: {
        conversationCount: conversations.count ?? 0,
        receivedMessageCount: receivedMessages.count ?? 0,
        unreadMessageCount: unreadMessages.count ?? 0,
      },
    }
  } catch (error) {
    console.error("[chat] getSellerChatMetrics", error)
    return { ok: false, error: CHAT_LOAD_ERROR }
  }
}

export async function getConversation(
  conversationId: string,
  userId: string,
): Promise<ChatServiceResult<ConversationDetails | null>> {
  if (!isConversationId(conversationId)) {
    return { ok: true, data: null }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
        id,
        buyer_id,
        seller_id,
        product:products!conversations_product_id_fkey (
          id,
          title,
          price,
          city,
          neighborhood,
          images:product_images ( storage_path, is_primary, sort_order )
        ),
        buyer:profiles!conversations_buyer_id_fkey ( id, display_name, avatar_path ),
        seller:profiles!conversations_seller_id_fkey ( id, display_name, avatar_path )
      `,
    )
    .eq("id", conversationId)
    .maybeSingle()

  if (error) {
    console.error("[chat] getConversation", error)
    return { ok: false, error: CHAT_LOAD_ERROR }
  }

  if (!data) {
    return { ok: true, data: null }
  }

  const details = mapConversationDetails(
    supabase,
    data as unknown as ConversationRow,
    userId,
  )

  return details
    ? { ok: true, data: details }
    : { ok: false, error: CHAT_LOAD_ERROR }
}

export async function getConversationMessages(
  conversationId: string,
  before?: { createdAt: string; id: string },
): Promise<ChatServiceResult<ChatMessagePage>> {
  if (
    !isConversationId(conversationId) ||
    (before &&
      (!isConversationId(before.id) ||
        !isChatCursorTimestamp(before.createdAt)))
  ) {
    return { ok: true, data: { messages: [], hasMore: false } }
  }

  const supabase = await createClient()
  let query = supabase
    .from("messages")
    .select(
      "id, conversation_id, sender_id, message_type, content, attachment_path, created_at, read_at",
    )
    .eq("conversation_id", conversationId)

  if (before) {
    query = query.or(
      `created_at.lt.${before.createdAt},and(created_at.eq.${before.createdAt},id.lt.${before.id})`,
    )
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(CHAT_MESSAGE_PAGE_SIZE + 1)

  if (error) {
    console.error("[chat] getConversationMessages", error)
    return { ok: false, error: MESSAGE_LOAD_ERROR }
  }

  const rows = (data ?? []) as MessageRow[]
  const hasMore = rows.length > CHAT_MESSAGE_PAGE_SIZE
  const page = rows.slice(0, CHAT_MESSAGE_PAGE_SIZE).reverse()

  return {
    ok: true,
    data: {
      messages: await addSignedImageUrls(supabase, page),
      hasMore,
    },
  }
}

export async function startOrGetConversation(
  productId: string,
): Promise<ChatServiceResult<string>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_or_create_conversation", {
    p_product_id: productId,
  })

  if (error || typeof data !== "string" || !isConversationId(data)) {
    console.error("[chat] startOrGetConversation", error ?? data)
    return { ok: false, error: CONVERSATION_START_ERROR }
  }

  return { ok: true, data }
}

export async function sendChatMessage(input: {
  conversationId: string
  senderId: string
  type: "text" | "image"
  content: string | null
  attachmentPath: string | null
}): Promise<ChatServiceResult<ChatMessage>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      message_type: input.type,
      content: input.content,
      attachment_path: input.attachmentPath,
    })
    .select(
      "id, conversation_id, sender_id, message_type, content, attachment_path, created_at, read_at",
    )
    .single()

  if (error || !data) {
    console.error("[chat] sendChatMessage", error)
    return { ok: false, error: MESSAGE_SAVE_ERROR }
  }

  const message = mapMessage(data as MessageRow)

  if (message.attachmentPath) {
    const [signedMessage] = await addSignedImageUrls(supabase, [data as MessageRow])
    return { ok: true, data: signedMessage }
  }

  return { ok: true, data: message }
}

export async function markConversationMessagesRead(
  conversationId: string,
  userId: string,
): Promise<ChatServiceResult<null>> {
  if (!isConversationId(conversationId)) {
    return { ok: false, error: READ_STATE_ERROR }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null)

  if (error) {
    console.error("[chat] markConversationMessagesRead", error)
    return { ok: false, error: READ_STATE_ERROR }
  }

  return { ok: true, data: null }
}
