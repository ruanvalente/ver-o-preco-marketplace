import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  deleteListing: vi.fn(),
  publishListing: vi.fn(),
  pauseListing: vi.fn(),
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock("next/cache", () => ({
  updateTag: mocks.updateTag,
  revalidatePath: mocks.revalidatePath,
}))

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}))

vi.mock("@/features/auth/services/session.service", () => ({
  requireUser: mocks.requireUser,
}))

vi.mock("../services/listing.service", () => ({
  createListing: vi.fn(),
  updateListing: vi.fn(),
  deleteListing: mocks.deleteListing,
  publishListing: mocks.publishListing,
  pauseListing: mocks.pauseListing,
}))

import { updateListingStatusAction } from "../services/listing.actions"

const listingId = "11111111-1111-4111-8111-111111111111"

function statusFormData(intent: "publish" | "pause" | "delete") {
  const formData = new FormData()
  formData.set("listingId", listingId)
  formData.set("returnTo", "/dashboard")
  formData.set("intent", intent)
  return formData
}

describe("updateListingStatusAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireUser.mockResolvedValue({ id: "seller-1" })
    mocks.deleteListing.mockResolvedValue({ ok: true, data: null })
    mocks.publishListing.mockResolvedValue({ ok: true, data: null })
    mocks.pauseListing.mockResolvedValue({ ok: true, data: null })
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`)
    })
  })

  it.each(["publish", "pause", "delete"] as const)(
    "invalida products:list ao concluir %s",
    async (intent) => {
      await expect(
        updateListingStatusAction(statusFormData(intent)),
      ).rejects.toThrow("NEXT_REDIRECT")

      expect(mocks.updateTag).toHaveBeenCalledWith("products:list")
      expect(mocks.revalidatePath).toHaveBeenCalledWith("/products")
    },
  )

  it("não invalida o catálogo quando a mutação falha", async () => {
    mocks.deleteListing.mockResolvedValue({ ok: false, error: "erro" })

    await expect(
      updateListingStatusAction(statusFormData("delete")),
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard?error=delete")

    expect(mocks.updateTag).not.toHaveBeenCalled()
  })
})
