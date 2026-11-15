import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import type { ChatParticipant } from "../types/chat.types"

type ChatHeaderProps = {
  participant: ChatParticipant
  isOnline: boolean
  isConnecting: boolean
  isOtherTyping: boolean
}

export function ChatHeader({
  participant,
  isOnline,
  isConnecting,
  isOtherTyping,
}: ChatHeaderProps) {
  const status = isOtherTyping
    ? "Digitando…"
    : isConnecting
      ? "Reconectando…"
      : isOnline
        ? "Online"
        : "Offline"

  return (
    <header className="flex min-h-[68px] items-center gap-3 px-4 py-2">
      <Link
        href="/messages"
        aria-label="Voltar para suas conversas"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:hidden"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
      </Link>
      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {participant.avatarUrl ? (
          <Image
            src={participant.avatarUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          participant.displayName.slice(0, 1).toUpperCase()
        )}
        {isOnline ? (
          <span
            aria-hidden="true"
            className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-success"
          />
        ) : null}
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-foreground">
          {participant.displayName}
        </h1>
        <span
          aria-live="polite"
          className={`block text-xs ${
            isOnline ? "text-success" : "text-muted-foreground"
          }`}
        >
          {status}
        </span>
      </div>
    </header>
  )
}
