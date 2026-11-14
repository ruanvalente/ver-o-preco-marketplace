"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { useEffect, useId, useState } from "react"

import { createClient } from "@/lib/supabase/client"

import { ChatNotificationBadge } from "./chat-notification-badge"

type ChatHeaderNotificationsProps = {
  initialCount?: number | null
  className?: string
  ariaLabel?: string
}

async function getUnreadConversationCount(): Promise<number | null> {
  const supabase = createClient()
  let offset = 0
  let unreadConversations = 0

  while (true) {
    const { data, error } = await supabase.rpc("get_chat_conversations", {
      p_limit: 100,
      p_offset: offset,
    })

    if (error || !Array.isArray(data)) {
      console.error("[chat-header] unread count", error ?? data)
      return null
    }

    unreadConversations += data.reduce((total, conversation) => {
      const unreadCount = Number(
        (conversation as { unread_count?: number | string | null })
          ?.unread_count ?? 0,
      )

      return total + (unreadCount > 0 ? 1 : 0)
    }, 0)

    if (data.length < 100) {
      return unreadConversations
    }

    offset += data.length
  }
}

export function ChatHeaderNotifications({
  initialCount = 0,
  className,
  ariaLabel = "Mensagens",
}: ChatHeaderNotificationsProps) {
  const [count, setCount] = useState<number | null>(initialCount)
  const instanceId = useId().replace(/:/g, "")

  useEffect(() => {
    let isMounted = true
    let latestRequest = 0
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
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          console.error("[chat-header] realtime subscription", status)
        }
      })

    return () => {
      isMounted = false
      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }
      void supabase.removeChannel(channel).catch((error: unknown) => {
        console.error("[chat-header] remove realtime channel", error)
      })
    }
  }, [instanceId])

  return (
    <Link
      href="/messages"
      aria-label={
        count === null
          ? `${ariaLabel}, contagem indisponível`
          : count > 0
            ? `${count} conversas com novas mensagens`
            : ariaLabel
      }
      className={className}
    >
      <MessageCircle aria-hidden="true" className="size-4" />
      {count !== null ? <ChatNotificationBadge count={count} /> : null}
    </Link>
  )
}
