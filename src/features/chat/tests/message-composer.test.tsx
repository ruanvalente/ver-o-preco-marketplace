import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

const mocks = vi.hoisted(() => ({
  sendChatImageAction: vi.fn(),
  sendChatTextAction: vi.fn(),
  deleteChatImage: vi.fn(),
  uploadChatImage: vi.fn(),
}))

vi.mock("../services/chat.actions", () => ({
  sendChatImageAction: mocks.sendChatImageAction,
  sendChatTextAction: mocks.sendChatTextAction,
}))

vi.mock("../services/chat-storage.service", () => ({
  deleteChatImage: mocks.deleteChatImage,
  uploadChatImage: mocks.uploadChatImage,
}))

import { MessageComposer } from "../components/message-composer"
import type { ChatMessage } from "../types/chat.types"

const message: ChatMessage = {
  id: "33333333-3333-4333-8333-333333333333",
  conversationId: "11111111-1111-4111-8111-111111111111",
  senderId: "22222222-2222-4222-8222-222222222222",
  type: "text",
  content: "Olá, ainda está disponível?",
  attachmentPath: null,
  imageUrl: null,
  createdAt: "2026-11-13T14:00:00.000Z",
  readAt: null,
}

describe("MessageComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.sendChatTextAction.mockResolvedValue({ ok: true, data: message })
  })

  it("sends trimmed text and returns the persisted message to the chat", async () => {
    const onMessageSent = vi.fn()

    render(
      <MessageComposer
        conversationId={message.conversationId}
        userId={message.senderId}
        onMessageSent={onMessageSent}
        onTyping={vi.fn()}
        onStopTyping={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByRole("textbox", { name: "Escreva sua mensagem" }), {
      target: { value: "  Olá, ainda está disponível?  " },
    })
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }))

    await waitFor(() => {
      expect(mocks.sendChatTextAction).toHaveBeenCalledWith(
        message.conversationId,
        "Olá, ainda está disponível?",
      )
    })
    expect(onMessageSent).toHaveBeenCalledWith(message)
  })
})
