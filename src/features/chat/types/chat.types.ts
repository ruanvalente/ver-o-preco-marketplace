export type ChatParticipant = {
  id: string
  displayName: string
  avatarUrl: string | null
}

export type ChatProductContext = {
  id: string
  title: string
  price: number
  location: string
  imageUrl: string | null
}

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  type: "text" | "image"
  content: string | null
  attachmentPath: string | null
  imageUrl: string | null
  createdAt: string
  readAt: string | null
}

export type ChatConversation = {
  id: string
  participant: ChatParticipant
  product: ChatProductContext
  lastMessage: Pick<
    ChatMessage,
    "id" | "type" | "content" | "senderId" | "createdAt"
  > | null
  unreadCount: number
  updatedAt: string
}

export type ConversationDetails = {
  id: string
  participant: ChatParticipant
  product: ChatProductContext
}

export type ChatActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export type ChatActionState = {
  status: "idle" | "error"
  message?: string
}

export type ChatMessagePage = {
  messages: ChatMessage[]
  hasMore: boolean
}
