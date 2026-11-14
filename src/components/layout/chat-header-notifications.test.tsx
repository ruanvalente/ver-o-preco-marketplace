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
})
