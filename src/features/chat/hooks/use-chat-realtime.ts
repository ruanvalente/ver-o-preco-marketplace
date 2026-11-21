"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"

import {
  CHAT_IMAGE_BUCKET,
  CHAT_MESSAGE_PAGE_SIZE,
  CHAT_SIGNED_URL_TTL_SECONDS,
} from "../constants"
import { getChatImageUrl } from "../services/chat-storage.service"
import type { ChatMessage } from "../types/chat.types"

const RECONNECT_BASE_DELAY_MS = 1000
const RECONNECT_MAX_DELAY_MS = 30000
const RECONNECT_JITTER_CAP_MS = 1000

/**
 * Exponential backoff for Realtime reconnects. `attempt` is one-based, so the
 * first failed connection schedules a retry after the base delay. `random` is
 * injectable to keep the schedule deterministic in tests.
 */
export function getRealtimeRetryDelay(
  attempt: number,
  random: () => number = Math.random,
): number {
  const safeAttempt = Math.max(1, Math.floor(attempt))
  const exponential = Math.min(
    RECONNECT_BASE_DELAY_MS * 2 ** (safeAttempt - 1),
    RECONNECT_MAX_DELAY_MS,
  )
  const jitter = Math.floor(random() * RECONNECT_JITTER_CAP_MS)

  return Math.min(exponential + jitter, RECONNECT_MAX_DELAY_MS)
}

type RealtimeMessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  message_type: "text" | "image"
  content: string | null
  attachment_path: string | null
  created_at: string
  read_at: string | null
}

type UseChatRealtimeOptions = {
  conversationId: string
  userId: string
  onMessage: (message: ChatMessage) => void
  onHistoryMessage: (message: ChatMessage) => void
}

function parseMessageRow(
  value: Record<string, unknown>,
  conversationId: string,
): RealtimeMessageRow | null {
  if (
    typeof value.id !== "string" ||
    value.conversation_id !== conversationId ||
    typeof value.sender_id !== "string" ||
    (value.message_type !== "text" && value.message_type !== "image") ||
    typeof value.created_at !== "string" ||
    (value.content !== null && typeof value.content !== "string") ||
    (value.attachment_path !== null &&
      typeof value.attachment_path !== "string") ||
    (value.read_at !== null && typeof value.read_at !== "string")
  ) {
    return null
  }

  return {
    id: value.id,
    conversation_id: conversationId,
    sender_id: value.sender_id,
    message_type: value.message_type,
    content: value.content,
    attachment_path: value.attachment_path,
    created_at: value.created_at,
    read_at: value.read_at,
  }
}

function mapMessage(row: RealtimeMessageRow, imageUrl: string | null): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    type: row.message_type,
    content: row.content,
    attachmentPath: row.attachment_path,
    imageUrl,
    createdAt: row.created_at,
    readAt: row.read_at,
  }
}

async function loadRecentMessages(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
  onHistoryMessage: (message: ChatMessage) => void,
  setConnectionError: (message: string | null) => void,
) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, sender_id, message_type, content, attachment_path, created_at, read_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(CHAT_MESSAGE_PAGE_SIZE)

  if (error) {
    console.error("[chat] sync recent messages", error)
    setConnectionError("Não foi possível atualizar as mensagens da conversa.")
    return
  }

  const rows = (data ?? [])
    .map((value) =>
      parseMessageRow(value as Record<string, unknown>, conversationId),
    )
    .filter((row): row is RealtimeMessageRow => row !== null)
    .reverse()
  const paths = [
    ...new Set(
      rows
        .map((row) => row.attachment_path)
        .filter((path): path is string => Boolean(path)),
    ),
  ]
  const imageUrls = new Map<string, string>()

  if (paths.length > 0) {
    const { data: signedImages, error: signedImagesError } =
      await supabase.storage
        .from(CHAT_IMAGE_BUCKET)
        .createSignedUrls(paths, CHAT_SIGNED_URL_TTL_SECONDS)

    if (signedImagesError) {
      console.error("[chat] sync recent image URLs", signedImagesError)
      setConnectionError("Não foi possível atualizar algumas imagens da conversa.")
    } else {
      for (const signedImage of signedImages ?? []) {
        if (signedImage.path && signedImage.signedUrl) {
          imageUrls.set(signedImage.path, signedImage.signedUrl)
        } else if (signedImage.error) {
          console.error("[chat] sync recent image URL", signedImage.error)
        }
      }
    }
  }

  for (const row of rows) {
    onHistoryMessage(
      mapMessage(
        row,
        row.attachment_path
          ? imageUrls.get(row.attachment_path) ?? null
          : null,
      ),
    )
  }
}

export function useChatRealtime({
  conversationId,
  userId,
  onMessage,
  onHistoryMessage,
}: UseChatRealtimeOptions) {
  const [isOnline, setIsOnline] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const onMessageRef = useRef(onMessage)
  const onHistoryMessageRef = useRef(onHistoryMessage)
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSentAtRef = useRef(0)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    onHistoryMessageRef.current = onHistoryMessage
  }, [onHistoryMessage])

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false
    let retryAttempt = 0
    let reconnectScheduled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let currentChannel: ReturnType<
      ReturnType<typeof createClient>["channel"]
    > | null = null

    const clearRetryTimer = () => {
      if (retryTimer) {
        clearTimeout(retryTimer)
        retryTimer = null
      }
    }

    const connect = () => {
      if (cancelled) {
        return
      }

      reconnectScheduled = false
      const channel = supabase.channel(`conversation:${conversationId}`, {
        config: {
          private: true,
          presence: { key: userId },
        },
      })
      currentChannel = channel
      channelRef.current = channel

      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const row = parseMessageRow(
              payload.new as Record<string, unknown>,
              conversationId,
            )

            if (!row) {
              console.error("[chat] Invalid realtime message payload")
              return
            }

            void (async () => {
              let imageUrl: string | null = null

              if (row.attachment_path) {
                const result = await getChatImageUrl(row.attachment_path)
                imageUrl = result.ok ? result.data : null

                if (!result.ok) {
                  setConnectionError(result.error)
                }
              }

              onMessageRef.current(mapMessage(row, imageUrl))
            })().catch((error: unknown) => {
              console.error("[chat] handle realtime message", error)
              setConnectionError(
                "Uma nova mensagem chegou, mas não foi possível carregar todo o conteúdo.",
              )
            })
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const row = parseMessageRow(
              payload.new as Record<string, unknown>,
              conversationId,
            )

            if (!row) {
              console.error("[chat] Invalid realtime message update payload")
              return
            }

            onMessageRef.current(mapMessage(row, null))
          },
        )
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if (
            payload &&
            typeof payload === "object" &&
            "userId" in payload &&
            payload.userId !== userId
          ) {
            setIsOtherTyping(
              "isTyping" in payload && payload.isTyping === true,
            )
          }
        })
        .on("presence", { event: "sync" }, () => {
          const presence = channel.presenceState()
          const hasOtherParticipant = Object.keys(presence).some(
            (presenceUserId) => presenceUserId !== userId,
          )
          setIsOnline(hasOtherParticipant)

          if (!hasOtherParticipant) {
            setIsOtherTyping(false)
          }
        })
        .subscribe((status) => {
          if (cancelled || currentChannel !== channel) {
            return
          }

          if (status === "SUBSCRIBED") {
            retryAttempt = 0
            clearRetryTimer()
            setIsConnecting(false)
            setConnectionError(null)
            void loadRecentMessages(
              supabase,
              conversationId,
              onHistoryMessageRef.current,
              setConnectionError,
            ).catch((error: unknown) => {
              console.error("[chat] sync recent messages", error)
              setConnectionError(
                "Não foi possível atualizar as mensagens da conversa.",
              )
            })
            void channel.track({ userId }).catch((error: unknown) => {
              console.error("[chat] track presence", error)
              setConnectionError("Não foi possível atualizar sua presença.")
            })
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            setIsConnecting(true)
            setIsOnline(false)
            setIsOtherTyping(false)
            channelRef.current = null

            if (!reconnectScheduled) {
              reconnectScheduled = true
              retryAttempt += 1
              const delay = getRealtimeRetryDelay(retryAttempt)
              setConnectionError(
                `Conexão instável. Tentando novamente em ${Math.ceil(delay / 1000)}s…`,
              )
              clearRetryTimer()
              void supabase.removeChannel(channel).catch((error: unknown) => {
                console.error("[chat] remove realtime channel", error)
              })
              retryTimer = setTimeout(() => {
                retryTimer = null
                connect()
              }, delay)
            }
          }
        })
    }

    connect()

    return () => {
      cancelled = true
      clearRetryTimer()

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      channelRef.current = null
      const channel = currentChannel
      currentChannel = null

      if (channel) {
        void supabase.removeChannel(channel).catch((error: unknown) => {
          console.error("[chat] remove realtime channel", error)
        })
      }
    }
  }, [conversationId, userId])

  const sendTypingEvent = useCallback((isTyping: boolean) => {
    const channel = channelRef.current

    if (!channel) {
      return
    }

    void channel
      .send({
        type: "broadcast",
        event: "typing",
        payload: { userId, isTyping },
      })
      .then((status) => {
        if (status !== "ok") {
          console.warn("[chat] typing broadcast status", status)
        }
      })
      .catch((error: unknown) => {
        console.error("[chat] broadcast typing", error)
      })
  }, [userId])

  const notifyTyping = useCallback(() => {
    const now = Date.now()

    if (now - lastTypingSentAtRef.current >= 1000) {
      lastTypingSentAtRef.current = now
      sendTypingEvent(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingEvent(false)
      typingTimeoutRef.current = null
    }, 1400)
  }, [sendTypingEvent])

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    sendTypingEvent(false)
  }, [sendTypingEvent])

  return {
    isOnline,
    isConnecting,
    isOtherTyping,
    connectionError,
    notifyTyping,
    stopTyping,
  }
}
