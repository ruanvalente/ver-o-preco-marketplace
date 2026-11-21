import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useChatMessages } from "../hooks/use-chat-messages"
import type { ChatMessage } from "../types/chat.types"

const mocks = vi.hoisted(() => ({
  loadOlderChatMessagesAction: vi.fn(),
  markChatMessagesReadAction: vi.fn(),
}))

vi.mock("../services/chat.actions", () => mocks)

const currentUserId = "22222222-2222-4222-8222-222222222222"

function createMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "message-id",
    conversationId: "11111111-1111-4111-8111-111111111111",
    senderId: "99999999-9999-4999-8999-999999999999",
    type: "text",
    content: "Olá",
    attachmentPath: null,
    imageUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    readAt: null,
    ...overrides,
  }
}

function renderMessages(messages: ChatMessage[] = []) {
  return renderHook(() =>
    useChatMessages({
      conversationId: "11111111-1111-4111-8111-111111111111",
      currentUserId,
      initialMessagePage: { messages, hasMore: true },
    }),
  )
}

describe("useChatMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("merges an incoming message into the list without duplicating it", () => {
    const existing = createMessage({
      id: "message-1",
      content: "Original",
      imageUrl: "https://example.com/original",
    })
    const incoming = createMessage({
      id: "message-1",
      content: "Editado",
      imageUrl: null,
    })
    const { result } = renderMessages([existing])

    act(() => {
      result.current.addMessage(incoming)
    })

    expect(result.current.messages).toEqual([
      createMessage({
        id: "message-1",
        content: "Editado",
        imageUrl: "https://example.com/original",
      }),
    ])
  })

  it("sorts appended messages by creation time and id", () => {
    const later = createMessage({
      id: "z",
      createdAt: "2026-01-02T00:00:00.000Z",
    })
    const { result } = renderMessages([later])

    act(() => {
      result.current.addMessage(
        createMessage({ id: "b", createdAt: "2026-01-01T00:00:00.000Z" }),
      )
      result.current.addMessage(
        createMessage({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
      )
    })

    expect(result.current.messages.map((message) => message.id)).toEqual([
      "a",
      "b",
      "z",
    ])
  })

  it("announces an incoming message", async () => {
    const { result } = renderMessages()

    act(() => {
      result.current.addMessage(createMessage({ id: "incoming" }))
    })

    await waitFor(() => {
      expect(result.current.announcement).toBe("Nova mensagem recebida.")
    })
  })

  it("does not announce a message sent by the user", async () => {
    const { result } = renderMessages()

    act(() => {
      result.current.addMessage(
        createMessage({ id: "own", senderId: currentUserId }),
      )
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(result.current.announcement).toBe("")
  })

  it("does not repeat the receipt while the first unread message is unchanged", async () => {
    mocks.markChatMessagesReadAction.mockResolvedValue({ ok: true, data: null })
    const { result } = renderMessages([
      createMessage({ id: "unread", readAt: null }),
    ])

    await waitFor(() => {
      expect(mocks.markChatMessagesReadAction).toHaveBeenCalledWith(
        "11111111-1111-4111-8111-111111111111",
      )
    })
    expect(mocks.markChatMessagesReadAction).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.addMessage(createMessage({ id: "zzz", readAt: null }))
    })

    expect(mocks.markChatMessagesReadAction).toHaveBeenCalledTimes(1)
    expect(result.current.isMarkingRead).toBe(false)
    expect(result.current.readError).toBeNull()
  })

  it("marks a new first unread message as read", async () => {
    mocks.markChatMessagesReadAction.mockResolvedValue({ ok: true, data: null })
    const { result } = renderMessages([
      createMessage({ id: "unread", readAt: null }),
    ])

    await waitFor(() => {
      expect(mocks.markChatMessagesReadAction).toHaveBeenCalledTimes(1)
    })

    act(() => {
      result.current.addMessage(createMessage({ id: "aaa", readAt: null }))
    })

    await waitFor(() => {
      expect(mocks.markChatMessagesReadAction).toHaveBeenCalledTimes(2)
    })
  })

  it("does not mark messages sent by the user as read", async () => {
    mocks.markChatMessagesReadAction.mockResolvedValue({ ok: true, data: null })

    renderMessages([
      createMessage({ id: "own", senderId: currentUserId, readAt: null }),
    ])

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mocks.markChatMessagesReadAction).not.toHaveBeenCalled()
  })

  it("exposes the action error when marking messages read fails", async () => {
    mocks.markChatMessagesReadAction.mockResolvedValue({
      ok: false,
      error: "Não foi possível atualizar o status de leitura.",
    })
    const { result } = renderMessages([
      createMessage({ id: "unread", readAt: null }),
    ])

    await waitFor(() => {
      expect(result.current.readError).toBe(
        "Não foi possível atualizar o status de leitura.",
      )
    })
    expect(result.current.isMarkingRead).toBe(false)
  })

  it("uses a human-readable message when marking messages read throws", async () => {
    mocks.markChatMessagesReadAction.mockRejectedValue(new Error("rpc failed"))
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    const { result } = renderMessages([
      createMessage({ id: "unread", readAt: null }),
    ])

    await waitFor(() => {
      expect(result.current.readError).toBe(
        "Não foi possível atualizar o status de leitura.",
      )
    })

    consoleError.mockRestore()
  })

  it("prepends an older page without duplicates and updates hasMore", async () => {
    const older = createMessage({
      id: "older",
      createdAt: "2025-12-31T00:00:00.000Z",
    })
    mocks.loadOlderChatMessagesAction.mockResolvedValue({
      ok: true,
      data: { messages: [older], hasMore: false },
    })
    const { result } = renderMessages([createMessage({ id: "newer" })])
    const scroll = {
      captureBeforeLoad: vi.fn(),
      preserveAfterLoad: vi.fn(),
    }

    await act(async () => {
      await result.current.loadOlderMessages(scroll)
    })

    expect(mocks.loadOlderChatMessagesAction).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      { createdAt: "2026-01-01T00:00:00.000Z", id: "newer" },
    )
    expect(result.current.messages.map((message) => message.id)).toEqual([
      "older",
      "newer",
    ])
    expect(result.current.hasMore).toBe(false)
    expect(scroll.captureBeforeLoad).toHaveBeenCalledTimes(1)
    expect(scroll.preserveAfterLoad).toHaveBeenCalledTimes(1)
    expect(result.current.isLoadingMore).toBe(false)

    mocks.loadOlderChatMessagesAction.mockResolvedValue({
      ok: true,
      data: {
        messages: [older, createMessage({ id: "oldest" })],
        hasMore: false,
      },
    })

    await act(async () => {
      await result.current.loadOlderMessages(scroll)
    })

    expect(result.current.messages.map((message) => message.id)).toEqual([
      "oldest",
      "older",
      "newer",
    ])
  })

  it("does not request an older page without a cursor", async () => {
    const { result } = renderMessages([])

    await act(async () => {
      await result.current.loadOlderMessages({
        captureBeforeLoad: vi.fn(),
        preserveAfterLoad: vi.fn(),
      })
    })

    expect(mocks.loadOlderChatMessagesAction).not.toHaveBeenCalled()
  })

  it("exposes the action error when loading an older page fails", async () => {
    mocks.loadOlderChatMessagesAction.mockResolvedValue({
      ok: false,
      error: "Conversa indisponível.",
    })
    const { result } = renderMessages([createMessage({ id: "newer" })])
    const scroll = {
      captureBeforeLoad: vi.fn(),
      preserveAfterLoad: vi.fn(),
    }

    await act(async () => {
      await result.current.loadOlderMessages(scroll)
    })

    expect(result.current.historyError).toBe("Conversa indisponível.")
    expect(result.current.messages.map((message) => message.id)).toEqual([
      "newer",
    ])
    expect(scroll.preserveAfterLoad).not.toHaveBeenCalled()
    expect(result.current.isLoadingMore).toBe(false)
  })

  it("uses a human-readable message when loading an older page throws", async () => {
    mocks.loadOlderChatMessagesAction.mockRejectedValue(new Error("rpc failed"))
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    const { result } = renderMessages([createMessage({ id: "newer" })])

    await act(async () => {
      await result.current.loadOlderMessages({
        captureBeforeLoad: vi.fn(),
        preserveAfterLoad: vi.fn(),
      })
    })

    expect(result.current.historyError).toBe(
      "Não foi possível carregar mensagens anteriores.",
    )

    consoleError.mockRestore()
  })
})
