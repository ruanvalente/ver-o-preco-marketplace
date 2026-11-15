"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  loadOlderChatMessagesAction,
  markChatMessagesReadAction,
} from "../services/chat.actions"
import { useChatRealtime } from "../hooks/use-chat-realtime"
import type {
  ChatConversation,
  ChatMessage,
  ChatMessagePage,
  ConversationDetails,
} from "../types/chat.types"
import { ChatHeader } from "./chat-header"
import { ConversationList } from "./conversation-list"
import { MessageComposer } from "./message-composer"
import { MessageList } from "./message-list"
import { ProductContext } from "./product-context"
import { RetryButton } from "./retry-button"

type ChatWindowProps = {
  conversation: ConversationDetails
  conversations: ChatConversation[]
  initialMessagePage: ChatMessagePage
  currentUserId: string
}

export function ChatWindow({
  conversation,
  conversations,
  initialMessagePage,
  currentUserId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState(initialMessagePage.messages)
  const [hasMore, setHasMore] = useState(initialMessagePage.hasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const previousCountRef = useRef(initialMessagePage.messages.length)
  const preserveScrollRef = useRef(false)
  const scrollMetricsRef = useRef({ top: 0, height: 0 })
  const readAttemptRef = useRef<string | null>(null)

  const addMessage = useCallback((message: ChatMessage) => {
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
  }, [currentUserId])

  const realtime = useChatRealtime({
    conversationId: conversation.id,
    userId: currentUserId,
    onMessage: addMessage,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [])

  useEffect(() => {
    if (preserveScrollRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      container.scrollTop =
        scrollMetricsRef.current.top +
        (container.scrollHeight - scrollMetricsRef.current.height)
      preserveScrollRef.current = false
    } else if (messages.length > previousCountRef.current) {
      bottomRef.current?.scrollIntoView({ block: "end" })
    }

    previousCountRef.current = messages.length
  }, [messages])

  const unreadIncoming = messages.find(
    (message) => message.senderId !== currentUserId && !message.readAt,
  )

  const markMessagesRead = useCallback(async () => {
    setIsMarkingRead(true)
    setReadError(null)
    try {
      const result = await markChatMessagesReadAction(conversation.id)

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
  }, [conversation.id])

  useEffect(() => {
    if (
      !unreadIncoming ||
      readAttemptRef.current === unreadIncoming.id
    ) {
      return
    }

    readAttemptRef.current = unreadIncoming.id
    void markMessagesRead()
  }, [markMessagesRead, unreadIncoming])

  async function loadOlderMessages() {
    const oldestMessage = messages[0]

    if (!oldestMessage || isLoadingMore) {
      return
    }

    const container = scrollContainerRef.current

    if (container) {
      scrollMetricsRef.current = {
        top: container.scrollTop,
        height: container.scrollHeight,
      }
    }

    setIsLoadingMore(true)
    setHistoryError(null)
    try {
      const result = await loadOlderChatMessagesAction(conversation.id, {
        createdAt: oldestMessage.createdAt,
        id: oldestMessage.id,
      })

      if (!result.ok) {
        setHistoryError(result.error)
        return
      }

      preserveScrollRef.current = true
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
  }

  return (
    <main className="mx-auto flex w-full max-w-[1320px] flex-1 p-0 md:px-4 md:py-6">
      <div className="grid h-[calc(100dvh-4rem)] min-h-[400px] w-full overflow-hidden border-y bg-card md:h-[min(820px,calc(100dvh-7rem))] md:min-h-[560px] md:grid-cols-[320px_minmax(0,1fr)] md:rounded-xl md:border">
        <aside className="hidden min-h-0 overflow-y-auto border-r md:block">
          <div className="border-b px-4 py-4">
            <h2 className="text-lg font-semibold text-foreground">Mensagens</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Conversas sobre seus anúncios
            </p>
          </div>
          <ConversationList
            conversations={conversations}
            currentUserId={currentUserId}
            selectedConversationId={conversation.id}
            onlineParticipantId={
              realtime.isOnline ? conversation.participant.id : null
            }
          />
        </aside>

        <section
          aria-label={`Conversa com ${conversation.participant.displayName}`}
          className="flex min-h-0 min-w-0 flex-col"
        >
          <ChatHeader
            participant={conversation.participant}
            isOnline={realtime.isOnline}
            isConnecting={realtime.isConnecting}
            isOtherTyping={realtime.isOtherTyping}
          />
          <ProductContext product={conversation.product} />
          {realtime.connectionError ? (
            <p role="status" className="border-b bg-warning/10 px-4 py-2 text-xs text-foreground">
              {realtime.connectionError}
            </p>
          ) : null}
          {historyError || readError ? (
            <div className="flex items-center justify-between gap-3 border-b bg-destructive/5 px-4 py-2">
              <p role="alert" className="text-xs text-destructive">
                {historyError ?? readError}
              </p>
              {readError || historyError ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isMarkingRead || isLoadingMore}
                  onClick={() => {
                    if (historyError) {
                      void loadOlderMessages()
                    }
                    if (readError) {
                      void markMessagesRead()
                    }
                  }}
                >
                  Tentar novamente
                </Button>
              ) : null}
            </div>
          ) : null}
          <MessageList
            containerRef={scrollContainerRef}
            bottomRef={bottomRef}
            messages={messages}
            currentUserId={currentUserId}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => void loadOlderMessages()}
          />
          <div className="sr-only" role="status" aria-live="polite">
            {announcement}
          </div>
          {realtime.isOtherTyping ? (
            <p className="px-4 pb-2 text-xs text-muted-foreground" aria-hidden="true">
              {conversation.participant.displayName} está digitando…
            </p>
          ) : null}
          <MessageComposer
            conversationId={conversation.id}
            userId={currentUserId}
            onMessageSent={addMessage}
            onTyping={realtime.notifyTyping}
            onStopTyping={realtime.stopTyping}
          />
        </section>
      </div>
    </main>
  )
}

export function ChatLoadError({ message }: { message: string }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-12">
      <section
        role="alert"
        className="w-full rounded-xl border border-destructive/30 bg-card px-6 py-10 text-center"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <MessageCircle aria-hidden="true" className="size-6" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-foreground">
          Não foi possível abrir a conversa
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button asChild className="mt-5">
          <Link href="/messages">
            Voltar para mensagens
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <RetryButton />
      </section>
    </main>
  )
}

export function ChatLoading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex w-full max-w-[1320px] flex-1 items-center justify-center px-4"
    >
      <p role="status" className="text-sm text-muted-foreground">
        Carregando conversa…
      </p>
    </main>
  )
}
