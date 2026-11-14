import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { ChatNotificationBadge } from "./chat-notification-badge"

describe("ChatNotificationBadge", () => {
  it("esconde a badge quando não há notificações", () => {
    const { container } = render(<ChatNotificationBadge count={0} />)

    expect(container).toBeEmptyDOMElement()
  })

  it("exibe o número de conversas com mensagens novas", () => {
    render(<ChatNotificationBadge count={3} />)

    expect(screen.getByLabelText("3 conversas com nova mensagem")).toBeInTheDocument()
  })
})
