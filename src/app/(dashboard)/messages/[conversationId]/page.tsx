import type { Metadata } from "next"
import { connection } from "next/server"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { requireUser } from "@/features/auth/services/session.service"
import {
  ChatLoading,
  ChatLoadError,
  ChatWindow,
} from "@/features/chat/components/chat-window"
import {
  getChatConversations,
  getConversation,
  getConversationMessages,
} from "@/features/chat/services/chat.service"

type ConversationRouteProps = {
  params: Promise<{ conversationId: string }>
}

export const metadata: Metadata = {
  title: "Conversa | Ver-o-Preço",
}

export default function ConversationRoute({
  params,
}: ConversationRouteProps) {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ConversationContent params={params} />
    </Suspense>
  )
}

async function ConversationContent({
  params,
}: ConversationRouteProps) {
  await connection()
  const { conversationId } = await params
  const user = await requireUser(`/messages/${conversationId}`)
  const [conversationResult, messagesResult, conversationsResult] =
    await Promise.all([
      getConversation(conversationId, user.id),
      getConversationMessages(conversationId),
      getChatConversations(),
    ])

  if (
    !conversationResult.ok ||
    !messagesResult.ok ||
    !conversationsResult.ok
  ) {
    const error = !conversationResult.ok
      ? conversationResult.error
      : !messagesResult.ok
        ? messagesResult.error
        : !conversationsResult.ok
          ? conversationsResult.error
          : "Não foi possível carregar esta conversa."

    return <ChatLoadError message={error} />
  }

  if (!conversationResult.data) {
    notFound()
  }

  return (
    <ChatWindow
      conversation={conversationResult.data}
      conversations={conversationsResult.data}
      initialMessagePage={messagesResult.data}
      currentUserId={user.id}
    />
  )
}
