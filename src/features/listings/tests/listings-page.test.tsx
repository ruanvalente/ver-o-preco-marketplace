import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const serviceMocks = vi.hoisted(() => ({
  getListingsForOwner: vi.fn(),
}))

vi.mock("@/features/listings/services/listing.service", () => serviceMocks)
vi.mock("@/features/listings/services/listing.actions", () => ({
  updateListingStatusAction: vi.fn(),
}))

import { ListingsPage } from "../components/listings-page"
import type { ListingSummary } from "../types/listing.types"
import { listingSummaryFixture, sellerId } from "./fixtures"

const draftSummary: ListingSummary = {
  ...listingSummaryFixture,
  status: "draft",
}

async function renderPage(
  feedback: Parameters<typeof ListingsPage>[0]["feedback"] = {},
) {
  render(await ListingsPage({ userId: sellerId, feedback }))
}

describe("ListingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("mostra o estado vazio com atalhos para criar e explorar", async () => {
    vi.mocked(serviceMocks.getListingsForOwner).mockResolvedValue({
      ok: true,
      data: [],
    })

    await renderPage()

    expect(serviceMocks.getListingsForOwner).toHaveBeenCalledWith(sellerId)
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Meus anúncios",
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Você ainda não tem anúncios",
      }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole("link", { name: "Criar anúncio" }),
    ).toHaveLength(2)
    for (const link of screen.getAllByRole("link", { name: "Criar anúncio" })) {
      expect(link).toHaveAttribute("href", "/listings/new")
    }
    expect(
      screen.getByRole("link", { name: "Explorar produtos" }),
    ).toHaveAttribute("href", "/products")
  })

  it("mostra um erro recuperável quando o carregamento falha", async () => {
    vi.mocked(serviceMocks.getListingsForOwner).mockResolvedValue({
      ok: false,
      error: "Não foi possível carregar o anúncio.",
    })

    await renderPage()

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar o anúncio. Tente novamente em instantes.",
    )
    expect(
      screen.getByRole("link", { name: "Tentar novamente" }),
    ).toHaveAttribute("href", "/listings")
  })

  it("lista os anúncios do usuário com as ações do proprietário", async () => {
    vi.mocked(serviceMocks.getListingsForOwner).mockResolvedValue({
      ok: true,
      data: [draftSummary, listingSummaryFixture],
    })

    await renderPage()

    expect(
      screen.getByRole("region", { name: "Seus anúncios" }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole("heading", {
        level: 2,
        name: listingSummaryFixture.title,
      }),
    ).toHaveLength(2)
    expect(screen.getByText("Rascunho")).toBeInTheDocument()
    expect(screen.getByText("Publicado")).toBeInTheDocument()

    const editLinks = screen.getAllByRole("link", { name: "Editar" })
    expect(editLinks[0]).toHaveAttribute(
      "href",
      `/listings/${draftSummary.id}/edit`,
    )

    // Rascunho pode ser publicado; anúncio ativo pode ser pausado.
    expect(
      screen.getByRole("button", { name: "Publicar" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Pausar" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Ver anúncio" }),
    ).toHaveAttribute("href", `/products/${listingSummaryFixture.id}`)
  })

  it("exibe o feedback de sucesso vindo da URL", async () => {
    vi.mocked(serviceMocks.getListingsForOwner).mockResolvedValue({
      ok: true,
      data: [],
    })

    await renderPage({ created: "published" })

    expect(
      screen.getByText("Anúncio publicado! Ele já aparece no marketplace."),
    ).toBeInTheDocument()
  })

  it("traduz códigos de erro em mensagens seguras", async () => {
    vi.mocked(serviceMocks.getListingsForOwner).mockResolvedValue({
      ok: true,
      data: [],
    })

    await renderPage({ error: "delete" })

    expect(
      screen.getByText("Não foi possível excluir o anúncio."),
    ).toBeInTheDocument()
  })
})
