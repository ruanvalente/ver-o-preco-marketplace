import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
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
      rpc: mocks.rpc,
      channel: () => channel,
      removeChannel: vi.fn().mockResolvedValue("ok"),
    }
  },
}))

import { ChatHeaderNotifications } from "./chat-header-notifications"

describe("ChatHeaderNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.callbacks = []
    mocks.onStatus = null
    mocks.rpc.mockResolvedValue({
      data: [{ unread_count: 0 }],
      error: null,
    })
  })

  it("reconciles the conversation count after successive realtime messages", async () => {
    render(<ChatHeaderNotifications />)

    await act(async () => {
      mocks.onStatus?.("SUBSCRIBED")
    })

    await waitFor(() => {
      expect(mocks.rpc).toHaveBeenCalledTimes(1)
    })

    mocks.rpc.mockResolvedValue({
      data: [{ unread_count: 1 }],
      error: null,
    })

    act(() => {
      mocks.callbacks[0]?.()
    })

    await waitFor(() => {
      expect(screen.getByLabelText("1 conversas com nova mensagem")).toBeInTheDocument()
    })

    mocks.rpc.mockResolvedValue({
      data: [{ unread_count: 2 }, { unread_count: 1 }],
      error: null,
    })

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

  it("exibe rótulo e contador inline na apresentação usada pelo menu mobile", () => {
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

  it("não exibe número na apresentação inline quando não há mensagens não lidas", () => {
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

  it("informa quando a contagem inline está indisponível", () => {
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

  it("mantém a atualização em tempo real na apresentação inline", async () => {
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
      expect(mocks.rpc).toHaveBeenCalledTimes(1)
    })

    mocks.rpc.mockResolvedValue({
      data: [{ unread_count: 2 }, { unread_count: 1 }],
      error: null,
    })

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
