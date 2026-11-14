import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

import type { ChatConversation } from "../types/chat.types"

type ConversationListProps = {
  conversations: ChatConversation[]
  currentUserId: string
  selectedConversationId?: string
  onlineParticipantId?: string | null
}

function formatConversationTime(value: string): string {
  const date = new Date(value)
  const dateKey = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Belem",
  }).format(date)
  const todayKey = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Belem",
  }).format(new Date())
  const sameDay = dateKey === todayKey

  return new Intl.DateTimeFormat(
    "pt-BR",
    sameDay
      ? { hour: "2-digit", minute: "2-digit", timeZone: "America/Belem" }
      : { day: "2-digit", month: "2-digit", timeZone: "America/Belem" },
  ).format(date)
}

function getConversationPreview({
  conversation,
  currentUserId,
}: {
  conversation: ChatConversation
  currentUserId: string
}) {
  const lastMessage = conversation.lastMessage

  if (!lastMessage) {
    return "Comece a conversa sobre este anúncio."
  }

  const preview =
    lastMessage.type === "image"
      ? "Imagem"
      : (lastMessage.content ?? "").replace(/\s+/g, " ").trim()
  const prefix = lastMessage.senderId === currentUserId ? "Você: " : ""

  return `${prefix}${preview}`
}

export function ConversationList({
  conversations,
  currentUserId,
  selectedConversationId,
  onlineParticipantId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-muted text-primary">
          <MessageCircle aria-hidden="true" className="size-6" />
        </span>
        <h2 className="text-base font-semibold text-foreground">
          Nenhuma conversa por aqui
        </h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Quando você conversar sobre um anúncio, o histórico aparecerá nesta
          lista.
        </p>
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Explorar anúncios
        </Link>
      </div>
    )
  }

  return (
    <nav aria-label="Suas conversas" className="divide-y">
      {conversations.map((conversation) => {
        const selected = conversation.id === selectedConversationId
        const isOnline = conversation.participant.id === onlineParticipantId
        const preview = getConversationPreview({ conversation, currentUserId })

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            aria-current={selected ? "page" : undefined}
            className={`flex min-h-[76px] items-center gap-3 px-3 py-3 transition-colors hover:bg-accent focus-visible:z-10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 ${
              selected ? "bg-primary-muted/60" : "bg-card"
            }`}
          >
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {conversation.participant.avatarUrl ? (
                <Image
                  src={conversation.participant.avatarUrl}
                  alt=""
                  width={44}
                  height={44}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                conversation.participant.displayName.slice(0, 1).toUpperCase()
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {conversation.participant.displayName}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {isOnline ? (
                    <span className="inline-flex items-center gap-1 text-xs text-success">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-success"
                      />
                      Online
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {formatConversationTime(conversation.updatedAt)}
                  </span>
                </span>
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {conversation.product.title}
              </span>
              <span className="mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate text-sm text-muted-foreground">
                  {preview}
                </span>
                {conversation.unreadCount > 0 ? (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    <span className="sr-only">
                      {conversation.unreadCount} mensagens não lidas
                    </span>
                    <span aria-hidden="true">
                      {conversation.unreadCount > 9
                        ? "9+"
                        : conversation.unreadCount}
                    </span>
                  </span>
                ) : null}
              </span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
