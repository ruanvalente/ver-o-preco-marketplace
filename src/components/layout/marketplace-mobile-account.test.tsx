import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getProfile: vi.fn(),
  getFavoriteCount: vi.fn(),
  getUnreadChatConversationCount: vi.fn(),
}))

vi.mock("next/server", () => ({
  connection: vi.fn(),
}))
vi.mock("@/features/auth/services/session.service", () => ({
  getCurrentUser: mocks.getCurrentUser,
}))
vi.mock("@/features/profile/services/profile.service", () => ({
  getProfile: mocks.getProfile,
}))
vi.mock("@/features/favorites/services/favorites.service", () => ({
  getFavoriteCount: mocks.getFavoriteCount,
}))
vi.mock("@/features/chat/services/chat.service", () => ({
  getUnreadChatConversationCount: mocks.getUnreadChatConversationCount,
}))
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => {
    const channel = {
      on: () => channel,
      subscribe: () => channel,
    }

    return {
      rpc: vi.fn(),
      channel: () => channel,
      removeChannel: vi.fn().mockResolvedValue("ok"),
    }
  },
}))

import { Sheet } from "@/components/ui/sheet"

import { MarketplaceMobileAccount } from "./marketplace-mobile-account"

describe("MarketplaceMobileAccount", () => {
  it("shows the unread conversation count next to Chat, like Meus favoritos", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "seller-id",
      email: "ana@example.com",
    })
    mocks.getProfile.mockResolvedValue({
      displayName: "Ana Souza",
    })
    mocks.getFavoriteCount.mockResolvedValue({ ok: true, data: 2 })
    mocks.getUnreadChatConversationCount.mockResolvedValue(2)

    render(<Sheet>{await MarketplaceMobileAccount()}</Sheet>)

    expect(
      screen.getByRole("link", {
        name: "Chat, 2 conversas com novas mensagens",
      }),
    ).toHaveAttribute("href", "/messages")
    expect(screen.getByText("Chat")).toBeInTheDocument()
    expect(screen.getByText("Meus favoritos")).toBeInTheDocument()
    expect(
      screen.queryByLabelText("2 conversas com nova mensagem"),
    ).not.toBeInTheDocument()
  })

  it("hides counters when there are no favorites or unread messages", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "seller-id",
      email: "ana@example.com",
    })
    mocks.getProfile.mockResolvedValue({
      displayName: "Ana Souza",
    })
    mocks.getFavoriteCount.mockResolvedValue({ ok: true, data: 0 })
    mocks.getUnreadChatConversationCount.mockResolvedValue(0)

    render(<Sheet>{await MarketplaceMobileAccount()}</Sheet>)

    expect(screen.getByRole("link", { name: "Chat" })).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Meus favoritos, 0 anúncios" }),
    ).toBeInTheDocument()
  })
})
