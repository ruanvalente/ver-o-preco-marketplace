import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useChatScroll } from "../hooks/use-chat-scroll"
import type { ChatMessage } from "../types/chat.types"

function createMessage(id: string): ChatMessage {
  return {
    id,
    conversationId: "conversation-id",
    senderId: "sender-id",
    type: "text",
    content: "Olá",
    attachmentPath: null,
    imageUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    readAt: null,
  }
}

function renderScroll(initialMessages: ChatMessage[]) {
  let api!: ReturnType<typeof useChatScroll>

  function Harness({ messages }: { messages: ChatMessage[] }) {
    api = useChatScroll({ messages })

    return (
      <div data-testid="scroll-container" ref={api.scrollContainerRef}>
        <div data-testid="scroll-bottom" ref={api.bottomRef} />
      </div>
    )
  }

  const view = render(<Harness messages={initialMessages} />)

  return {
    get current() {
      return api
    },
    container: view.getByTestId("scroll-container"),
    bottom: view.getByTestId("scroll-bottom"),
    rerender: (messages: ChatMessage[]) =>
      view.rerender(<Harness messages={messages} />),
  }
}

function setScrollHeight(element: HTMLElement, height: number) {
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    value: height,
  })
}

describe("useChatScroll", () => {
  let scrollIntoView: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    })
  })

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView")
  })

  it("scrolls to the bottom when the conversation opens", () => {
    const harness = renderScroll([createMessage("first")])

    expect(harness.bottom.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "end" })
  })

  it("scrolls to the bottom when a new message arrives", () => {
    const first = createMessage("first")
    const harness = renderScroll([first])
    scrollIntoView.mockClear()

    harness.rerender([first, createMessage("second")])

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "end" })
  })

  it("preserves scroll position when older messages are prepended", () => {
    const first = createMessage("first")
    const harness = renderScroll([first])
    setScrollHeight(harness.container, 200)
    harness.container.scrollTop = 50
    scrollIntoView.mockClear()

    act(() => {
      harness.current.captureBeforeLoad()
      harness.current.preserveAfterLoad()
    })
    setScrollHeight(harness.container, 320)
    harness.rerender([createMessage("older"), first])

    expect(harness.container.scrollTop).toBe(170)
    expect(scrollIntoView).not.toHaveBeenCalled()

    harness.rerender([createMessage("older"), first, createMessage("newer")])

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
  })
})
