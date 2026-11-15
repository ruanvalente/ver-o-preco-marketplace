"use client"

import Image from "next/image"
import {
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from "react"

import { getChatImageUrl } from "../services/chat-storage.service"
import type { ChatMessage } from "../types/chat.types"

type MessageListProps = {
  messages: ChatMessage[]
  currentUserId: string
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  containerRef: RefObject<HTMLDivElement | null>
  bottomRef: RefObject<HTMLDivElement | null>
}

function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Belem",
  }).format(new Date(value))
}

function PrivateChatImage({
  path,
  initialUrl,
}: {
  path: string
  initialUrl: string | null
}) {
  const [imageUrl, setImageUrl] = useState(initialUrl)
  const [attemptedUrl, setAttemptedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!initialUrl)
  const [error, setError] = useState<string | null>(null)

  const refreshUrl = useCallback(async () => {
    try {
      const result = await getChatImageUrl(path)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setImageUrl(result.data)
    } catch (requestError) {
      console.error("[chat] refresh image URL", requestError)
      setError("Não foi possível abrir esta imagem.")
    } finally {
      setIsLoading(false)
    }
  }, [path])

  useEffect(() => {
    if (initialUrl) {
      return
    }

    let active = true

    void getChatImageUrl(path)
      .then((result) => {
        if (!active) {
          return
        }

        if (result.ok) {
          setImageUrl(result.data)
        } else {
          setError(result.error)
        }
      })
      .catch((requestError: unknown) => {
        console.error("[chat] load image URL", requestError)
        if (active) {
          setError("Não foi possível abrir esta imagem.")
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [initialUrl, path])

  function handleImageError() {
    if (imageUrl && attemptedUrl !== imageUrl) {
      setAttemptedUrl(imageUrl)
      setIsLoading(true)
      setError(null)
      void refreshUrl()
      return
    }

    setError("Não foi possível carregar esta imagem.")
  }

  if (error) {
    return (
      <div className="space-y-1">
        <p className="text-sm">{error}</p>
        <button
          type="button"
          onClick={() => {
            setAttemptedUrl(null)
            setIsLoading(true)
            setError(null)
            void refreshUrl()
          }}
          className="min-h-11 rounded-md px-2 text-xs font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Tentar carregar de novo
        </button>
      </div>
    )
  }

  if (isLoading || !imageUrl) {
    return (
      <span role="status" className="text-sm">
        Carregando imagem…
      </span>
    )
  }

  return (
    <a
      href={imageUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir imagem enviada em outra aba"
      className="block overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Image
        src={imageUrl}
        alt="Imagem enviada na conversa"
        width={320}
        height={240}
        unoptimized
        onError={handleImageError}
        className="max-h-64 w-auto max-w-full rounded-lg object-contain"
      />
    </a>
  )
}

export function MessageList({
  messages,
  currentUserId,
  hasMore,
  isLoadingMore,
  onLoadMore,
  containerRef,
  bottomRef,
}: MessageListProps) {
  return (
    <div
      ref={containerRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
    >
      {hasMore ? (
        <div className="mb-4 flex justify-center">
          <button
            type="button"
            disabled={isLoadingMore}
            onClick={onLoadMore}
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-primary hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
          >
            {isLoadingMore ? "Carregando…" : "Carregar mensagens anteriores"}
          </button>
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="flex h-full min-h-48 items-center justify-center">
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Esta conversa ainda não tem mensagens. Envie uma mensagem para
            começar.
          </p>
        </div>
      ) : (
        <ol
          aria-label="Mensagens da conversa"
          aria-live="off"
          className="mx-auto flex w-full max-w-3xl flex-col gap-3"
        >
          {messages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId

            return (
              <li
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <article
                  aria-label={
                    isOwnMessage ? "Sua mensagem" : "Mensagem recebida"
                  }
                  className={`max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-[75%] ${
                    isOwnMessage
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border bg-card text-foreground"
                  }`}
                >
                  {message.type === "image" ? (
                    message.attachmentPath ? (
                      <PrivateChatImage
                        key={message.imageUrl ?? message.attachmentPath}
                        path={message.attachmentPath}
                        initialUrl={message.imageUrl}
                      />
                    ) : (
                      <p className="text-sm">
                        Não foi possível carregar esta imagem.
                      </p>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.content}
                    </p>
                  )}
                  <footer
                    className={`mt-1 flex items-center justify-end gap-2 text-[11px] ${
                      isOwnMessage
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground"
                    }`}
                  >
                    <time dateTime={message.createdAt}>
                      {formatMessageTime(message.createdAt)}
                    </time>
                    {isOwnMessage ? (
                      <span>
                        {message.readAt ? "Lida" : "Enviada"}
                      </span>
                    ) : null}
                  </footer>
                </article>
              </li>
            )
          })}
        </ol>
      )}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  )
}
