import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { ConversationList } from "../components/conversation-list"
import type { ChatConversation } from "../types/chat.types"

const conversation: ChatConversation = {
  id: "11111111-1111-4111-8111-111111111111",
  participant: {
    id: "22222222-2222-4222-8222-222222222222",
    displayName: "Ana Souza",
    avatarUrl: null,
  },
  product: {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Bicicleta urbana",
    price: 600,
    location: "Belém - Nazaré",
    imageUrl: null,
  },
  lastMessage: {
    id: "44444444-4444-4444-8444-444444444444",
    type: "text",
    content: "Ainda está disponível?",
    senderId: "22222222-2222-4222-8222-222222222222",
    createdAt: "2026-11-13T14:00:00.000Z",
  },
  unreadCount: 2,
  updatedAt: "2026-11-13T14:00:00.000Z",
}

describe("ConversationList", () => {
  it("shows product context, last message, unread count and a conversation link", () => {
    render(
      <ConversationList
        conversations={[conversation]}
        currentUserId="55555555-5555-4555-8555-555555555555"
      />,
    )

    expect(
      screen.getByRole("link", { name: /Ana Souza.*Bicicleta urbana/ }),
    ).toHaveAttribute("href", `/messages/${conversation.id}`)
    expect(screen.getByText("Ainda está disponível?")).toBeInTheDocument()
    expect(screen.getByText("2 mensagens não lidas")).toBeInTheDocument()
  })

  it("explains how the list is populated when there are no conversations", () => {
    render(<ConversationList conversations={[]} currentUserId={conversation.participant.id} />)

    expect(
      screen.getByRole("heading", { name: "Nenhuma conversa por aqui" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Explorar anúncios" }),
    ).toHaveAttribute("href", "/products")
  })
})
