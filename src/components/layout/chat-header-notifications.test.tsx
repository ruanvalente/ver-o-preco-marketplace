import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getUnreadConversationCount: vi.fn(),
  callbacks: [] as Array<() => void>,
  onStatus: null as null | ((status: string) => void),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => {
    const channel = {
      on: (_type: string, _filter: unknown, callback: () => void) => {
        mocks.callbacks.push(callback)
        return channel
      },
      subscribe: (callback: (status: string) => void) => {
        mocks.onStatus = callback
        return channel
      },
    }

    return {
      channel: () => channel,
      removeChannel: vi.fn().mockResolvedValue("ok"),
    }
  },
}))

vi.mock("@/features/chat/services/chat-client.service", () => ({
  getUnreadConversationCount: mocks.getUnreadConversationCount,
}))

import { ChatHeaderNotifications } from "./chat-header-notifications"

describe("ChatHeaderNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.callbacks = []
    mocks.onStatus = null
    mocks.getUnreadConversationCount.mockResolvedValue(0)
  })

  it("reconciles the conversation count after successive realtime messages", async () => {
    render(<ChatHeaderNotifications />)

    await act(async () => {
      mocks.onStatus?.("SUBSCRIBED")
    })

    await waitFor(() => {
      expect(mocks.getUnreadConversationCount).toHaveBeenCalledTimes(1)
    })

    mocks.getUnreadConversationCount.mockResolvedValue(1)

    act(() => {
      mocks.callbacks[0]?.()
    })

    await waitFor(() => {
      expect(screen.getByLabelText("1 conversas com nova mensagem")).toBeInTheDocument()
    })

    mocks.getUnreadConversationCount.mockResolvedValue(2)

    act(() => {
      mocks.callbacks[0]?.()
    })

    await waitFor(() => {
      expect(screen.getByLabelText("2 conversas com nova mensagem")).toBeInTheDocument()
    })
  })

  it("does not report CLOSED as an error when the channel is removed on unmount", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})

    const { unmount } = render(<ChatHeaderNotifications />)

    await act(async () => {
      mocks.onStatus?.("SUBSCRIBED")
    })

    unmount()

    await act(async () => {
      mocks.onStatus?.("CLOSED")
    })

    expect(consoleError).not.toHaveBeenCalledWith(
      "[chat-header] realtime subscription",
      "CLOSED",
    )

    consoleError.mockRestore()
  })

  it("logs CLOSED as an error when the channel closes unexpectedly while mounted", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})

    render(<ChatHeaderNotifications />)

    await act(async () => {
      mocks.onStatus?.("SUBSCRIBED")
    })

    act(() => {
      mocks.onStatus?.("CLOSED")
    })

    expect(consoleError).toHaveBeenCalledWith(
      "[chat-header] realtime subscription",
      "CLOSED",
    )

    consoleError.mockRestore()
  })

  it("renders the inline label and count used by the mobile menu", () => {
    render(
      <ChatHeaderNotifications
        initialCount={2}
        presentation="inline"
        ariaLabel="Chat"
      />,
    )

    expect(
      screen.getByRole("link", {
        name: "Chat, 2 conversas com novas mensagens",
      }),
    ).toHaveAttribute("href", "/messages")
    expect(screen.getByText("Chat")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(
      screen.queryByLabelText("2 conversas com nova mensagem"),
    ).not.toBeInTheDocument()
  })

  it("does not render a number in inline presentation when there are no unread messages", () => {
    render(
      <ChatHeaderNotifications
        initialCount={0}
        presentation="inline"
        ariaLabel="Chat"
      />,
    )

    expect(screen.getByRole("link", { name: "Chat" })).toBeInTheDocument()
    expect(screen.queryByText("0")).not.toBeInTheDocument()
  })

  it("renders no numeric badge in icon presentation when the count is unavailable", () => {
    render(<ChatHeaderNotifications initialCount={null} />)

    expect(
      screen.getByRole("link", {
        name: "Mensagens, contagem indisponível",
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/conversas com nova mensagem/),
    ).not.toBeInTheDocument()
  })

  it("reports when the inline count is unavailable", () => {
    render(
      <ChatHeaderNotifications
        initialCount={null}
        presentation="inline"
        ariaLabel="Chat"
      />,
    )

    expect(
      screen.getByRole("link", { name: "Chat, contagem indisponível" }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/\d/)).not.toBeInTheDocument()
  })

  it("keeps realtime updates in the inline presentation", async () => {
    render(
      <ChatHeaderNotifications
        initialCount={0}
        presentation="inline"
        ariaLabel="Chat"
      />,
    )

    await act(async () => {
      mocks.onStatus?.("SUBSCRIBED")
    })

    await waitFor(() => {
      expect(mocks.getUnreadConversationCount).toHaveBeenCalledTimes(1)
    })

    mocks.getUnreadConversationCount.mockResolvedValue(2)

    act(() => {
      mocks.callbacks[0]?.()
    })

    await waitFor(() => {
      expect(
        screen.getByRole("link", {
          name: "Chat, 2 conversas com novas mensagens",
        }),
      ).toBeInTheDocument()
    })
    expect(screen.getByText("2")).toBeInTheDocument()
  })
})
