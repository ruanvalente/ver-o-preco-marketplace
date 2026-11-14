import { describe, expect, it } from "vitest"

import {
  validateChatAttachmentPath,
  validateChatImageFile,
  validateMessageText,
} from "../schemas/chat.schemas"

const conversationId = "11111111-1111-4111-8111-111111111111"
const userId = "22222222-2222-4222-8222-222222222222"
const filename = "33333333-3333-4333-8333-333333333333.jpg"

describe("chat validation", () => {
  it("trims text and rejects empty or oversized messages", () => {
    expect(validateMessageText("  Olá!  ")).toEqual({
      ok: true,
      data: "Olá!",
    })
    expect(validateMessageText("  ")).toMatchObject({ ok: false })
    expect(validateMessageText("x".repeat(2001))).toMatchObject({
      ok: false,
      error: expect.stringContaining("2000"),
    })
  })

  it("accepts supported image types within the size limit", () => {
    expect(
      validateChatImageFile({ type: "image/webp", size: 1024 }),
    ).toEqual({ ok: true, data: null })
    expect(
      validateChatImageFile({ type: "image/svg+xml", size: 1024 }),
    ).toMatchObject({ ok: false })
    expect(
      validateChatImageFile({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 }),
    ).toMatchObject({ ok: false })
  })

  it("only accepts image paths belonging to this user and conversation", () => {
    const path = `${conversationId}/${userId}/${filename}`

    expect(validateChatAttachmentPath(path, conversationId, userId)).toEqual({
      ok: true,
      data: path,
    })
    expect(
      validateChatAttachmentPath(
        `${conversationId}/99999999-9999-4999-8999-999999999999/${filename}`,
        conversationId,
        userId,
      ),
    ).toMatchObject({ ok: false })
    expect(
      validateChatAttachmentPath(
        `${conversationId}/${userId}/../private.svg`,
        conversationId,
        userId,
      ),
    ).toMatchObject({ ok: false })
  })
})
