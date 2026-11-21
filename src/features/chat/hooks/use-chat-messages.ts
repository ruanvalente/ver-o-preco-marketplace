"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  loadOlderChatMessagesAction,
  markChatMessagesReadAction,
} from "../services/chat.actions"
import type { ChatMessage, ChatMessagePage } from "../types/chat.types"
import type { ChatScrollPreservation } from "./use-chat-scroll"

type UseChatMessagesOptions = {
  conversationId: string
  currentUserId: string
  initialMessagePage: ChatMessagePage
}

export function useChatMessages({
  conversationId,
  currentUserId,
  initialMessagePage,
}: UseChatMessagesOptions) {
  const [messages, setMessages] = useState(initialMessagePage.messages)
  const [announcement, setAnnouncement] = useState("")
  const [readError, setReadError] = useState<string | null>(null)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [hasMore, setHasMore] = useState(initialMessagePage.hasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const readAttemptRef = useRef<string | null>(null)

  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((current) => {
        const existingIndex = current.findIndex((item) => item.id === message.id)

        if (existingIndex >= 0) {
          const updated = current.slice()
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...message,
            imageUrl: message.imageUrl ?? updated[existingIndex].imageUrl,
          }
          return updated
        }

        return [...current, message].sort(
          (left, right) =>
            left.createdAt.localeCompare(right.createdAt) ||
            left.id.localeCompare(right.id),
        )
      })

      if (message.senderId !== currentUserId) {
        setAnnouncement("")
        window.setTimeout(
          () => setAnnouncement("Nova mensagem recebida."),
          0,
        )
      }
    },
    [currentUserId],
  )

  const unreadIncoming = messages.find(
    (message) => message.senderId !== currentUserId && !message.readAt,
  )

  const markMessagesRead = useCallback(async () => {
    setIsMarkingRead(true)
    setReadError(null)
    try {
      const result = await markChatMessagesReadAction(conversationId)

      if (!result.ok) {
        setReadError(result.error)
        readAttemptRef.current = null
      }
    } catch (error) {
      console.error("[chat] mark messages read", error)
      setReadError("Não foi possível atualizar o status de leitura.")
      readAttemptRef.current = null
    } finally {
      setIsMarkingRead(false)
    }
  }, [conversationId])

  useEffect(() => {
    if (!unreadIncoming || readAttemptRef.current === unreadIncoming.id) {
      return
    }

    readAttemptRef.current = unreadIncoming.id
    void markMessagesRead()
  }, [markMessagesRead, unreadIncoming])

  const loadOlderMessages = useCallback(
    async (scroll: ChatScrollPreservation) => {
      const oldestMessage = messages[0]

      if (!oldestMessage || isLoadingMore) {
        return
      }

      scroll.captureBeforeLoad()

      setIsLoadingMore(true)
      setHistoryError(null)
      try {
        const result = await loadOlderChatMessagesAction(conversationId, {
          createdAt: oldestMessage.createdAt,
          id: oldestMessage.id,
        })

        if (!result.ok) {
          setHistoryError(result.error)
          return
        }

        scroll.preserveAfterLoad()
        setMessages((current) => {
          const currentIds = new Set(current.map((message) => message.id))
          const olderMessages = result.data.messages.filter(
            (message) => !currentIds.has(message.id),
          )
          return [...olderMessages, ...current]
        })
        setHasMore(result.data.hasMore)
      } catch (error) {
        console.error("[chat] load older messages", error)
        setHistoryError("Não foi possível carregar mensagens anteriores.")
      } finally {
        setIsLoadingMore(false)
      }
    },
    [conversationId, isLoadingMore, messages],
  )

  return {
    messages,
    hasMore,
    isLoadingMore,
    historyError,
    readError,
    isMarkingRead,
    announcement,
    addMessage,
    markMessagesRead,
    loadOlderMessages,
  }
}
