import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ChatMessage } from "../types/chat.types"
import { ChatWindow } from "../components/chat-window"

const mocks = vi.hoisted(() => ({
  useChatMessages: vi.fn(),
  useChatScroll: vi.fn(),
  useChatRealtime: vi.fn(),
  sendChatTextAction: vi.fn(),
  sendChatImageAction: vi.fn(),
}))

vi.mock("../hooks/use-chat-messages", () => ({
  useChatMessages: mocks.useChatMessages,
}))
vi.mock("../hooks/use-chat-scroll", () => ({
  useChatScroll: mocks.useChatScroll,
}))
vi.mock("../hooks/use-chat-realtime", () => ({
  useChatRealtime: mocks.useChatRealtime,
}))
vi.mock("../services/chat.actions", () => ({
  sendChatTextAction: mocks.sendChatTextAction,
  sendChatImageAction: mocks.sendChatImageAction,
}))

const conversationId = "11111111-1111-4111-8111-111111111111"
const currentUserId = "22222222-2222-4222-8222-222222222222"

const conversation = {
  id: conversationId,
  participant: {
    id: "99999999-9999-4999-8999-999999999999",
    displayName: "Ana",
    avatarUrl: null,
  },
  product: {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Açaí",
    price: 20,
    location: "Belém",
    imageUrl: null,
  },
}

function createMessage(id: string): ChatMessage {
  return {
    id,
    conversationId,
    senderId: currentUserId,
    type: "text",
    content: "Olá",
    attachmentPath: null,
    imageUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    readAt: null,
  }
}

function renderWindow(overrides: Record<string, unknown> = {}) {
  const addMessage = vi.fn()
  const markMessagesRead = vi.fn()
  const loadOlderMessages = vi.fn().mockResolvedValue(undefined)
  const captureBeforeLoad = vi.fn()
  const preserveAfterLoad = vi.fn()
  const notifyTyping = vi.fn()
  const stopTyping = vi.fn()

  mocks.useChatMessages.mockReturnValue({
    messages: [],
    hasMore: true,
    isLoadingMore: false,
    historyError: null,
    readError: null,
    isMarkingRead: false,
    announcement: "",
    addMessage,
    markMessagesRead,
    loadOlderMessages,
    ...overrides,
  })
  mocks.useChatScroll.mockReturnValue({
    scrollContainerRef: { current: null },
    bottomRef: { current: null },
    captureBeforeLoad,
    preserveAfterLoad,
  })
  mocks.useChatRealtime.mockReturnValue({
    isOnline: false,
    isConnecting: false,
    isOtherTyping: false,
    connectionError: null,
    notifyTyping,
    stopTyping,
  })

  const view = render(
    <ChatWindow
      conversation={conversation}
      conversations={[]}
      initialMessagePage={{ messages: [], hasMore: true }}
      currentUserId={currentUserId}
    />,
  )

  return {
    ...view,
    addMessage,
    markMessagesRead,
    loadOlderMessages,
    captureBeforeLoad,
    preserveAfterLoad,
    notifyTyping,
    stopTyping,
  }
}

describe("ChatWindow composition", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("passes the conversation data to the chat hooks", () => {
    renderWindow()

    expect(mocks.useChatMessages).toHaveBeenCalledWith({
      conversationId,
      currentUserId,
      initialMessagePage: { messages: [], hasMore: true },
    })
    expect(mocks.useChatScroll).toHaveBeenCalledWith({ messages: [] })
  })

  it("keeps the conversation region and its accessibility label", () => {
    renderWindow()

    expect(
      screen.getByRole("region", { name: "Conversa com Ana" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Voltar para suas conversas" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Mensagens" })).toBeInTheDocument()
  })

  it("passes the message handler to Realtime and the composer", async () => {
    const sent = createMessage("sent")
    mocks.sendChatTextAction.mockResolvedValue({ ok: true, data: sent })
    const harness = renderWindow()

    expect(mocks.useChatRealtime).toHaveBeenCalledWith({
      conversationId,
      userId: currentUserId,
      onMessage: expect.any(Function),
    })
    expect(mocks.useChatRealtime.mock.calls[0][0].onMessage).toBe(
      harness.addMessage,
    )

    fireEvent.change(screen.getByLabelText("Escreva sua mensagem"), {
      target: { value: "Olá" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }))

    await waitFor(() => {
      expect(harness.addMessage).toHaveBeenCalledWith(sent)
    })
  })

  it("forwards scroll preservation when loading older messages", () => {
    const harness = renderWindow()

    fireEvent.click(
      screen.getByRole("button", { name: "Carregar mensagens anteriores" }),
    )

    expect(harness.loadOlderMessages).toHaveBeenCalledWith({
      captureBeforeLoad: harness.captureBeforeLoad,
      preserveAfterLoad: harness.preserveAfterLoad,
    })
  })

  it("retries the read receipt from the error banner", () => {
    const harness = renderWindow({
      readError: "Não foi possível atualizar o status de leitura.",
    })

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }))

    expect(harness.markMessagesRead).toHaveBeenCalledTimes(1)
  })
})
