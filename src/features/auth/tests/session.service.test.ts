import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn(),
  isListingOwnedBy: vi.fn(),
}))

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()
  return {
    ...actual,
    cache: (fn: (...args: unknown[]) => unknown) => fn,
  }
})

vi.mock("@/config/env", () => ({
  hasSupabaseEnv: () => true,
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}))

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}))

vi.mock("@/features/listings/services/listing.service", () => ({
  isListingOwnedBy: mocks.isListingOwnedBy,
}))

import { requireOwnership } from "../services/session.service"

function mockAuthUser(id = "user-1") {
  mocks.createClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id, email: "user@example.com" } },
        error: null,
      }),
    },
  })
}

describe("requireOwnership", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthUser()
  })

  it("retorna o usuário autenticado quando ele é o proprietário", async () => {
    mocks.isListingOwnedBy.mockResolvedValue({ ok: true, data: true })

    const result = await requireOwnership(
      "/listings/listing-1/edit",
      "listing-1",
    )

    expect(result).toEqual({
      ok: true,
      user: { id: "user-1", email: "user@example.com" },
    })
    expect(mocks.isListingOwnedBy).toHaveBeenCalledWith(
      "user-1",
      "listing-1",
    )
  })

  it("nega acesso quando o anúncio pertence a outro usuário", async () => {
    mocks.isListingOwnedBy.mockResolvedValue({ ok: true, data: false })

    const result = await requireOwnership(
      "/listings/listing-1/edit",
      "listing-1",
    )

    expect(result).toEqual({ ok: false, reason: "not-owner" })
  })

  it("reporta indisponibilidade quando a consulta ao banco falha", async () => {
    mocks.isListingOwnedBy.mockResolvedValue({ ok: false, error: "boom" })

    const result = await requireOwnership(
      "/listings/listing-1/edit",
      "listing-1",
    )

    expect(result).toEqual({ ok: false, reason: "unavailable" })
  })

  it("redireciona para o login quando não há sessão ativa", async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT")
    })
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    })

    await expect(
      requireOwnership("/listings/listing-1/edit", "listing-1"),
    ).rejects.toThrow("NEXT_REDIRECT")

    expect(mocks.isListingOwnedBy).not.toHaveBeenCalled()
  })
})
