import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getProfile: vi.fn(),
  getFavoriteCount: vi.fn(),
  getChatConversations: vi.fn(),
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
  getChatConversations: mocks.getChatConversations,
}))
vi.mock("@/features/auth/services/auth.actions", () => ({
  logoutAction: vi.fn(),
}))
vi.mock("./chat-header-notifications", () => ({
  ChatHeaderNotifications: () => null,
}))

import { MarketplaceAccountArea } from "./marketplace-account-area"

describe("MarketplaceAccountArea", () => {
  it("opens the account menu with the real name, email, profile, and logout action", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "seller-id",
      email: "ana@example.com",
    })
    mocks.getProfile.mockResolvedValue({
      id: "seller-id",
      displayName: "Ana Souza",
      avatarPath: null,
      avatarUrl: null,
      location: "Belém",
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
    })
    mocks.getFavoriteCount.mockResolvedValue({ ok: true, data: 2 })
    mocks.getChatConversations.mockResolvedValue({ ok: true, data: [] })

    render(await MarketplaceAccountArea())

    fireEvent.keyDown(
      screen.getByRole("button", { name: "Menu da conta de Ana Souza" }),
      { key: "Enter" },
    )

    expect(await screen.findByText("ana@example.com")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Meu perfil" })).toHaveAttribute(
      "href",
      "/profile",
    )
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument()
  })
})
