"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { useEffect, useId, useState } from "react"

import { getUnreadConversationCount } from "@/features/chat/services/chat-client.service"
import { createClient } from "@/lib/supabase/client"

import { ChatNotificationBadge } from "./chat-notification-badge"

type ChatHeaderNotificationsProps = {
  initialCount?: number | null
  className?: string
  ariaLabel?: string
  /**
   * `icon` mantém o badge de canto usado no header; `inline` exibe rótulo e
   * contador na mesma linha, como os itens do menu mobile (Meus favoritos 2).
   */
  presentation?: "icon" | "inline"
}

export function ChatHeaderNotifications({
  initialCount = 0,
  className,
  ariaLabel = "Mensagens",
  presentation = "icon",
}: ChatHeaderNotificationsProps) {
  const [count, setCount] = useState<number | null>(initialCount)
  const instanceId = useId().replace(/:/g, "")

  useEffect(() => {
    let isMounted = true
    let latestRequest = 0
    let isLeaving = false
    let refreshTimer: ReturnType<typeof setTimeout> | null = null
    const supabase = createClient()
    const channel = supabase.channel(`header-chat-notifications:${instanceId}`)

    const refreshCount = async () => {
      const requestId = ++latestRequest
      try {
        const nextCount = await getUnreadConversationCount()

        if (isMounted && requestId === latestRequest && nextCount !== null) {
          setCount(nextCount)
        }
      } catch (error) {
        console.error("[chat-header] refresh unread count", error)
      }
    }

    const scheduleRefresh = () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }

      refreshTimer = setTimeout(() => {
        refreshTimer = null
        void refreshCount()
      }, 50)
    }

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        scheduleRefresh,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void refreshCount()
        } else if (
          !isLeaving &&
          (status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED")
        ) {
          console.error("[chat-header] realtime subscription", status)
        }
      })

    return () => {
      isMounted = false
      isLeaving = true
      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }
      void supabase.removeChannel(channel).catch((error: unknown) => {
        console.error("[chat-header] remove realtime channel", error)
      })
    }
  }, [instanceId])

  const accessibleLabel =
    count === null
      ? `${ariaLabel}, contagem indisponível`
      : count > 0
        ? presentation === "inline"
          ? `${ariaLabel}, ${count} ${count === 1 ? "conversa com nova mensagem" : "conversas com novas mensagens"}`
          : `${count} conversas com novas mensagens`
        : ariaLabel

  return (
    <Link href="/messages" aria-label={accessibleLabel} className={className}>
      <MessageCircle aria-hidden="true" className="size-4" />
      {presentation === "inline" ? (
        <>
          {ariaLabel}
          {count !== null && count > 0 ? (
            <span
              aria-hidden="true"
              className="ml-1 rounded-full bg-primary-muted px-2 py-0.5 text-xs text-primary"
            >
              {count}
            </span>
          ) : null}
        </>
      ) : null}
      {presentation === "icon" && count !== null ? (
        <ChatNotificationBadge count={count} />
      ) : null}
    </Link>
  )
}
