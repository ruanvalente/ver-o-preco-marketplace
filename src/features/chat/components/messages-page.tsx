import { MessageCircle } from "lucide-react"

import type { ChatServiceResult } from "../services/chat.service"
import type { ChatConversation } from "../types/chat.types"
import { ConversationList } from "./conversation-list"
import { RetryButton } from "./retry-button"

type MessagesPageProps = {
  result: ChatServiceResult<ChatConversation[]>
  currentUserId: string
}

export function MessagesPage({
  result,
  currentUserId,
}: MessagesPageProps) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Mensagens
        </h1>
        <p className="text-sm text-muted-foreground">
          Suas conversas sobre anúncios, em um só lugar.
        </p>
      </header>

      {result.ok ? (
        <section
          aria-label="Lista de conversas"
          className="overflow-hidden rounded-xl border bg-card"
        >
          <ConversationList
            conversations={result.data}
            currentUserId={currentUserId}
          />
        </section>
      ) : (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-card px-5 py-8 text-center"
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <MessageCircle aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-3 text-sm text-foreground">{result.error}</p>
          <RetryButton />
        </div>
      )}
    </main>
  )
}
