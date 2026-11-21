import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  getRealtimeRetryDelay,
  useChatRealtime,
} from "../hooks/use-chat-realtime"
import type { ChatMessage } from "../types/chat.types"

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getChatImageUrl: vi.fn(),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: mocks.createClient,
}))

vi.mock("../services/chat-storage.service", () => ({
  getChatImageUrl: mocks.getChatImageUrl,
}))

type SubscribeCallback = (status: string) => void

function createChannelMock() {
  let notify: SubscribeCallback = () => {}
  const channel = {
    on: vi.fn(),
    subscribe: vi.fn((callback: SubscribeCallback) => {
      notify = callback
      return channel
    }),
    track: vi.fn().mockResolvedValue("ok"),
    send: vi.fn().mockResolvedValue("ok"),
    presenceState: vi.fn(() => ({})),
    fail: () => notify("CHANNEL_ERROR"),
    succeed: () => notify("SUBSCRIBED"),
  }
  channel.on.mockReturnValue(channel)

  return channel
}

function createSupabaseMock() {
  const channels: Array<ReturnType<typeof createChannelMock>> = []
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  }

  return {
    channels,
    removeChannel: vi.fn().mockResolvedValue("ok"),
    channel: vi.fn(() => {
      const channel = createChannelMock()
      channels.push(channel)
      return channel
    }),
    from: vi.fn(() => chain),
    storage: {
      from: vi.fn(() => ({ createSignedUrls: vi.fn() })),
    },
  }
}

const conversationId = "11111111-1111-4111-8111-111111111111"
const userId = "22222222-2222-4222-8222-222222222222"

function renderRealtime({
  onMessage = vi.fn(),
  onHistoryMessage = vi.fn(),
}: {
  onMessage?: (message: ChatMessage) => void
  onHistoryMessage?: (message: ChatMessage) => void
} = {}) {
  const view = renderHook(() =>
    useChatRealtime({ conversationId, userId, onMessage, onHistoryMessage }),
  )

  return { ...view, onMessage, onHistoryMessage }
}

describe("getRealtimeRetryDelay", () => {
  it("grows exponentially and caps at 30 seconds", () => {
    expect(getRealtimeRetryDelay(1, () => 0)).toBe(1000)
    expect(getRealtimeRetryDelay(2, () => 0)).toBe(2000)
    expect(getRealtimeRetryDelay(3, () => 0)).toBe(4000)
    expect(getRealtimeRetryDelay(4, () => 0)).toBe(8000)
    expect(getRealtimeRetryDelay(10, () => 0)).toBe(30000)
  })

  it("adds jitter without exceeding the cap", () => {
    expect(getRealtimeRetryDelay(1, () => 0.5)).toBe(1500)
    expect(getRealtimeRetryDelay(10, () => 0.99)).toBe(30000)
  })
})

describe("useChatRealtime reconnect", () => {
  let supabase: ReturnType<typeof createSupabaseMock>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.spyOn(Math, "random").mockReturnValue(0)
    supabase = createSupabaseMock()
    mocks.createClient.mockReturnValue(supabase)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("reconnects with backoff after a channel error", async () => {
    const { result } = renderRealtime()

    expect(supabase.channels).toHaveLength(1)

    await act(async () => {
      supabase.channels[0].fail()
    })

    expect(supabase.removeChannel).toHaveBeenCalledTimes(1)
    expect(result.current.connectionError).toContain("Tentando novamente em 1s")
    expect(supabase.channels).toHaveLength(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(supabase.channels).toHaveLength(2)
    expect(supabase.channels[1].subscribe).toHaveBeenCalledTimes(1)

    await act(async () => {
      supabase.channels[1].succeed()
    })

    expect(result.current.isConnecting).toBe(false)
    expect(result.current.connectionError).toBeNull()
  })

  it("increases the delay after repeated failures", async () => {
    const { result } = renderRealtime()

    await act(async () => {
      supabase.channels[0].fail()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(supabase.channels).toHaveLength(2)

    await act(async () => {
      supabase.channels[1].fail()
    })

    expect(result.current.connectionError).toContain("Tentando novamente em 2s")

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999)
    })
    expect(supabase.channels).toHaveLength(2)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(supabase.channels).toHaveLength(3)
  })

  it("routes subscription resync messages to the history callback", async () => {
    supabase.from().limit.mockResolvedValue({
      data: [
        {
          id: "resynced",
          conversation_id: conversationId,
          sender_id: "99999999-9999-4999-8999-999999999999",
          message_type: "text",
          content: "Histórico recente",
          attachment_path: null,
          created_at: "2026-01-01T00:00:00.000Z",
          read_at: null,
        },
      ],
      error: null,
    })
    const { onMessage, onHistoryMessage } = renderRealtime()

    await act(async () => {
      supabase.channels[0].succeed()
    })

    expect(onHistoryMessage).toHaveBeenCalledTimes(1)
    expect(onHistoryMessage).toHaveBeenCalledWith(
      expect.objectContaining({ id: "resynced", content: "Histórico recente" }),
    )
    expect(onMessage).not.toHaveBeenCalled()
  })

  it("cancels a pending reconnect on unmount", async () => {
    const { unmount } = renderRealtime()

    await act(async () => {
      supabase.channels[0].fail()
    })
    expect(supabase.removeChannel).toHaveBeenCalledTimes(1)

    unmount()
    expect(supabase.removeChannel).toHaveBeenCalledTimes(2)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000)
    })
    expect(supabase.channels).toHaveLength(1)
  })
})
