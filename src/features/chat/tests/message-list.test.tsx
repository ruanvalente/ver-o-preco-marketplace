import { render, screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"

import { MessageList } from "../components/message-list"
import type { ChatMessage } from "../types/chat.types"

const currentUserId = "22222222-2222-4222-8222-222222222222"

function createMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "message-1",
    conversationId: "11111111-1111-4111-8111-111111111111",
    senderId: "99999999-9999-4999-8999-999999999999",
    type: "text",
    content: "Chegou o açaí?",
    attachmentPath: null,
    imageUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    readAt: null,
    ...overrides,
  }
}

function renderList({
  messages = [createMessage()],
  isLoadingMore = false,
  hasMore = false,
  announcedMessageIds = new Set<string>(),
}: {
  messages?: ChatMessage[]
  isLoadingMore?: boolean
  hasMore?: boolean
  announcedMessageIds?: Set<string>
} = {}) {
  return render(
    <MessageList
      messages={messages}
      announcedMessageIds={announcedMessageIds}
      currentUserId={currentUserId}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={vi.fn()}
      containerRef={createRef<HTMLDivElement>()}
      bottomRef={createRef<HTMLDivElement>()}
    />,
  )
}

function getLog() {
  return screen.getByRole("log", { name: "Mensagens da conversa" })
}

describe("MessageList accessibility", () => {
  it("announces incoming message text in a polite log region", () => {
    renderList({ announcedMessageIds: new Set(["message-1"]) })

    expect(getLog()).toHaveAttribute("aria-live", "polite")
    expect(getLog()).toHaveAttribute("aria-relevant", "additions")
    expect(getLog()).toHaveClass("h-full")
    expect(getLog().querySelector("li")).not.toHaveAttribute("aria-live")
    expect(getLog()).toHaveTextContent("Chegou o açaí?")
    expect(screen.queryByRole("status")).toBeNull()
  })

  it("keeps history messages out of the live announcements", () => {
    renderList({
      messages: [
        createMessage({ id: "history" }),
        createMessage({ id: "live", content: "Nova mensagem" }),
      ],
      announcedMessageIds: new Set(["live"]),
    })

    const items = getLog().querySelectorAll("li")

    expect(items[0]).toHaveAttribute("aria-live", "off")
    expect(items[1]).not.toHaveAttribute("aria-live")
    expect(getLog()).toHaveTextContent("Nova mensagem")
  })

  it("keeps the log region mounted before the first message arrives", () => {
    renderList({ messages: [] })

    expect(getLog()).toBeInTheDocument()
    expect(
      screen.getByText(/Esta conversa ainda não tem mensagens/),
    ).toBeInTheDocument()
  })

  it("marks the log as busy while older messages are loading", () => {
    renderList({ hasMore: true, isLoadingMore: true })

    expect(getLog()).toHaveAttribute("aria-busy", "true")
  })

  it("is not busy when the history is idle", () => {
    renderList()

    expect(getLog()).toHaveAttribute("aria-busy", "false")
  })
})
