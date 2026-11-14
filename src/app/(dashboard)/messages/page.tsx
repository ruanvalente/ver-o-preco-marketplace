import type { Metadata } from "next"
import { connection } from "next/server"

import { requireUser } from "@/features/auth/services/session.service"
import { getChatConversations } from "@/features/chat/services/chat.service"
import { MessagesPage } from "@/features/chat/components/messages-page"

export const metadata: Metadata = {
  title: "Mensagens | Ver-o-Preço",
}

export default async function MessagesRoute() {
  await connection()
  const user = await requireUser("/messages")
  const result = await getChatConversations()

  return <MessagesPage result={result} currentUserId={user.id} />
}
