import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  requireOwnership: vi.fn(),
  createListing: vi.fn(),
  updateListing: vi.fn(),
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
  requireOwnership: mocks.requireOwnership,
}))

vi.mock("../services/listing.service", () => ({
  NOT_FOUND_ERROR: "Anúncio não encontrado ou sem permissão para editá-lo.",
  createListing: mocks.createListing,
  updateListing: mocks.updateListing,
  deleteListing: mocks.deleteListing,
  publishListing: mocks.publishListing,
  pauseListing: mocks.pauseListing,
}))

import { updateListingAction, updateListingStatusAction } from "../services/listing.actions"
import { categoryId, listingId } from "./fixtures"

const otherUserId = "99999999-9999-4999-8999-999999999999"

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
    mocks.requireOwnership.mockResolvedValue({
      ok: true,
      user: { id: "seller-1" },
    })
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

  it("redireciona com erro invalid quando o listingId não é um UUID", async () => {
    const formData = new FormData()
    formData.set("listingId", "nao-e-um-uuid")
    formData.set("returnTo", "/dashboard")
    formData.set("intent", "publish")

    await expect(
      updateListingStatusAction(formData),
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard?error=invalid")

    expect(mocks.requireOwnership).not.toHaveBeenCalled()
    expect(mocks.publishListing).not.toHaveBeenCalled()
  })

  it("redireciona com erro unexpected quando a verificação de propriedade falha", async () => {
    mocks.requireOwnership.mockResolvedValue({
      ok: false,
      reason: "unavailable",
    })

    await expect(
      updateListingStatusAction(statusFormData("pause")),
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard?error=unexpected")

    expect(mocks.pauseListing).not.toHaveBeenCalled()
    expect(mocks.updateTag).not.toHaveBeenCalled()
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })

  it("redireciona com erro forbidden quando o anúncio não pertence ao usuário", async () => {
    mocks.requireOwnership.mockResolvedValue({
      ok: false,
      reason: "not-owner",
    })

    await expect(
      updateListingStatusAction(statusFormData("publish")),
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard?error=forbidden")

    expect(mocks.publishListing).not.toHaveBeenCalled()
    expect(mocks.deleteListing).not.toHaveBeenCalled()
    expect(mocks.pauseListing).not.toHaveBeenCalled()
    expect(mocks.updateTag).not.toHaveBeenCalled()
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })

  it("não consulta a propriedade quando o listingId é inválido", async () => {
    const formData = new FormData()
    formData.set("returnTo", "/dashboard")
    formData.set("intent", "publish")

    await expect(
      updateListingStatusAction(formData),
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard?error=invalid")

    expect(mocks.requireOwnership).not.toHaveBeenCalled()
    expect(mocks.publishListing).not.toHaveBeenCalled()
  })

  it("não executa a mutação quando o usuário não é proprietário (delete)", async () => {
    mocks.requireOwnership.mockResolvedValue({
      ok: false,
      reason: "not-owner",
    })

    await expect(
      updateListingStatusAction(statusFormData("delete")),
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard?error=forbidden")

    expect(mocks.deleteListing).not.toHaveBeenCalled()
  })

  it("usa o id do proprietário retornado por requireOwnership na mutação", async () => {
    mocks.requireOwnership.mockResolvedValue({
      ok: true,
      user: { id: otherUserId },
    })

    await expect(
      updateListingStatusAction(statusFormData("pause")),
    ).rejects.toThrow("NEXT_REDIRECT")

    expect(mocks.requireOwnership).toHaveBeenCalledWith("/dashboard", listingId)
    expect(mocks.pauseListing).toHaveBeenCalledWith(otherUserId, listingId)
  })
})

function validUpdateFormData() {
  const formData = new FormData()
  formData.set("listingId", listingId)
  formData.set("intent", "save")
  formData.set("title", "iPhone 15 Pro")
  formData.set("description", "Excelente estado.")
  formData.set("categoryId", categoryId)
  formData.set("condition", "like_new")
  formData.set("price", "1500,50")
  formData.set("city", "Belém")
  formData.set("neighborhood", "Nazaré")
  formData.set("images", "[]")
  return formData
}

describe("updateListingAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireOwnership.mockResolvedValue({
      ok: true,
      user: { id: "seller-1" },
    })
    mocks.updateListing.mockResolvedValue({ ok: true, data: { id: listingId } })
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`)
    })
  })

  it("retorna erro amigável quando o anúncio não pertence ao usuário", async () => {
    mocks.requireOwnership.mockResolvedValue({
      ok: false,
      reason: "not-owner",
    })

    const state = await updateListingAction(
      { status: "idle" },
      validUpdateFormData(),
    )

    expect(state).toEqual({
      status: "error",
      message: "Anúncio não encontrado ou sem permissão para editá-lo.",
    })
    expect(mocks.updateListing).not.toHaveBeenCalled()
    expect(mocks.updateTag).not.toHaveBeenCalled()
  })

  it("retorna erro com retry quando a verificação de propriedade falha", async () => {
    mocks.requireOwnership.mockResolvedValue({
      ok: false,
      reason: "unavailable",
    })

    const state = await updateListingAction(
      { status: "idle" },
      validUpdateFormData(),
    )

    expect(state).toEqual({
      status: "error",
      message: "Não foi possível verificar o anúncio. Tente novamente.",
    })
    expect(mocks.updateListing).not.toHaveBeenCalled()
    expect(mocks.updateTag).not.toHaveBeenCalled()
  })

  it("atualiza o anúncio quando o usuário é proprietário", async () => {
    await expect(
      updateListingAction({ status: "idle" }, validUpdateFormData()),
    ).rejects.toThrow("NEXT_REDIRECT")

    expect(mocks.requireOwnership).toHaveBeenCalledWith(
      `/listings/${listingId}/edit`,
      listingId,
    )
    expect(mocks.updateListing).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "seller-1", listingId }),
    )
    expect(mocks.updateTag).toHaveBeenCalledWith("products:list")
  })
})
