"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ImagePlus, LoaderCircle, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  CHAT_IMAGE_ACCEPT,
  CHAT_MESSAGE_MAX_LENGTH,
} from "../constants"
import { validateChatImageFile } from "../schemas/chat.schemas"
import {
  sendChatImageAction,
  sendChatTextAction,
} from "../services/chat.actions"
import {
  deleteChatImage,
  uploadChatImage,
} from "../services/chat-storage.service"
import type { ChatMessage } from "../types/chat.types"

type MessageComposerProps = {
  conversationId: string
  userId: string
  onMessageSent: (message: ChatMessage) => void
  onTyping: () => void
  onStopTyping: () => void
}

export function MessageComposer({
  conversationId,
  userId,
  onMessageSent,
  onTyping,
  onStopTyping,
}: MessageComposerProps) {
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function clearImageSelection() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setPreviewUrl(null)
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleImageChange(file: File | undefined) {
    if (!file) {
      return
    }

    const validation = validateChatImageFile(file)

    if (!validation.ok) {
      setError(validation.error)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setError(null)
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    previewUrlRef.current = url
    setPreviewUrl(url)
    setImage(file)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const content = text.trim()

    if ((!content && !image) || isSending) {
      return
    }

    setIsSending(true)
    setError(null)
    onStopTyping()
    let uploadedPath: string | null = null

    try {
      if (image) {
        const upload = await uploadChatImage(conversationId, userId, image)

        if (!upload.ok) {
          setError(upload.error)
          return
        }
        uploadedPath = upload.data

        const sentImage = await sendChatImageAction(
          conversationId,
          upload.data,
        )

        if (!sentImage.ok) {
          const cleanup = await deleteChatImage(upload.data)
          if (cleanup.ok) {
            uploadedPath = null
          }
          setError(
            cleanup.ok
              ? sentImage.error
              : `${sentImage.error} A imagem poderá permanecer armazenada temporariamente.`,
          )
          return
        }

        uploadedPath = null
        onMessageSent(sentImage.data)
        clearImageSelection()
      }

      if (content) {
        const sentText = await sendChatTextAction(conversationId, content)

        if (!sentText.ok) {
          setError(sentText.error)
          return
        }

        onMessageSent(sentText.data)
        setText("")
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
        }
      }
    } catch (sendError) {
      console.error("[chat] send message", sendError)
      if (uploadedPath) {
        const cleanup = await deleteChatImage(uploadedPath)
        setError(
          cleanup.ok
            ? "Não foi possível enviar a mensagem. Tente novamente."
            : "Não foi possível enviar a mensagem e a imagem poderá permanecer armazenada temporariamente.",
        )
      } else {
        setError("Não foi possível enviar a mensagem. Tente novamente.")
      }
    } finally {
      setIsSending(false)
    }
  }

  function handleTextChange(value: string) {
    setText(value)

    if (value.trim()) {
      onTyping()
    } else {
      onStopTyping()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t bg-card px-3 py-3 sm:px-4"
    >
      {error ? (
        <p role="alert" className="mb-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {previewUrl ? (
        <div className="mb-3 flex items-start gap-3">
          <Image
            src={previewUrl}
            alt="Prévia da imagem que será enviada"
            width={96}
            height={72}
            unoptimized
            className="max-h-20 w-auto rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remover imagem selecionada"
            className="size-11"
            onClick={clearImageSelection}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          id={`chat-image-${conversationId}`}
          type="file"
          accept={CHAT_IMAGE_ACCEPT}
          aria-label="Selecionar imagem para enviar"
          className="sr-only"
          onChange={(event) => handleImageChange(event.currentTarget.files?.[0])}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Anexar imagem"
          disabled={isSending}
          className="size-11"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus aria-hidden="true" className="size-5" />
        </Button>
        <textarea
          ref={textareaRef}
          id={`message-${conversationId}`}
          value={text}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          rows={1}
          aria-label="Escreva sua mensagem"
          aria-describedby={`message-hint-${conversationId}`}
          placeholder="Escreva sua mensagem"
          disabled={isSending}
          className="max-h-32 min-h-11 flex-1 resize-y rounded-lg border bg-background px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60 sm:text-sm"
          onChange={(event) => {
            handleTextChange(event.currentTarget.value)
            event.currentTarget.style.height = "auto"
            event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 128)}px`
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isSending || (!text.trim() && !image)}
          aria-label="Enviar mensagem"
          aria-busy={isSending}
          className="size-11"
        >
          {isSending ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-5 motion-safe:animate-spin"
            />
          ) : (
            <Send aria-hidden="true" className="size-5" />
          )}
        </Button>
      </div>
      <p
        id={`message-hint-${conversationId}`}
        className="mt-1 px-1 text-right text-xs text-muted-foreground"
      >
        {text.length}/{CHAT_MESSAGE_MAX_LENGTH}
      </p>
    </form>
  )
}
