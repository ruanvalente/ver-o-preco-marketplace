import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getUnreadChatConversationCount: vi.fn(),
}))

vi.mock("next/server", () => ({
  connection: vi.fn(),
}))
vi.mock("@/features/auth/services/session.service", () => ({
  getCurrentUser: mocks.getCurrentUser,
}))
vi.mock("@/features/chat/services/chat.service", () => ({
  getUnreadChatConversationCount: mocks.getUnreadChatConversationCount,
}))
vi.mock("@/features/auth/components/logout-button", () => ({
  LogoutButton: () => null,
}))
vi.mock("./chat-header-notifications", () => ({
  ChatHeaderNotifications: ({
    initialCount,
  }: {
    initialCount?: number | null
  }) => <div data-testid="unread-count">{String(initialCount)}</div>,
}))

import { HeaderAuth } from "./header-auth"

describe("HeaderAuth", () => {
  it("falls back to zero when the unread count is unavailable", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "seller-id",
      email: "ana@example.com",
    })
    mocks.getUnreadChatConversationCount.mockResolvedValue(null)

    render(await HeaderAuth())

    expect(screen.getByTestId("unread-count")).toHaveTextContent("0")
  })

  it("passes the unread count to the notification widget", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "seller-id",
      email: "ana@example.com",
    })
    mocks.getUnreadChatConversationCount.mockResolvedValue(3)

    render(await HeaderAuth())

    expect(screen.getByTestId("unread-count")).toHaveTextContent("3")
  })
})
