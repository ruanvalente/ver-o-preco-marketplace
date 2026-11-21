import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const actionMocks = vi.hoisted(() => ({
  createListingAction: vi.fn(),
  updateListingAction: vi.fn(),
}))

vi.mock("@/features/listings/services/listing.actions", () => actionMocks)

import { ListingForm } from "../components/listing-form"
import type { Listing } from "../types/listing.types"
import { formatEditablePrice } from "../utils/format"
import { categoryId, listingFixture } from "./fixtures"

const categories = [
  { id: categoryId, name: "Celulares" },
  { id: "44444444-4444-4444-8444-444444444444", name: "Móveis" },
]

function renderCreateForm() {
  render(
    <ListingForm
      mode="create"
      userId={listingFixture.sellerId}
      categories={categories}
    />,
  )
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/^Título/), {
    target: { value: "iPhone 15 Pro" },
  })
  fireEvent.change(screen.getByLabelText(/^Categoria/), {
    target: { value: categoryId },
  })
  fireEvent.change(screen.getByLabelText(/^Condição/), {
    target: { value: "like_new" },
  })
  fireEvent.change(screen.getByLabelText(/^Preço do anúncio/), {
    target: { value: "1.500,50" },
  })
  fireEvent.change(screen.getByLabelText(/^Município/), {
    target: { value: "Belém" },
  })
}

describe("ListingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders all sections and required fields with explicit labels", () => {
    renderCreateForm()

    expect(
      screen.getByRole("heading", { level: 1, name: "Novo anúncio" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 2, name: "Informações básicas" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 2, name: "Preço" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 2, name: "Localização" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 2, name: "Imagens" }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText(/^Título/)).toBeInTheDocument()
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument()
    expect(screen.getByLabelText(/^Categoria/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Condição/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Preço do anúncio/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Município/)).toBeInTheDocument()
    expect(screen.getByLabelText("Bairro")).toBeInTheDocument()
    expect(screen.getByLabelText("Imagens do anúncio")).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: "Salvar rascunho" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Publicar anúncio" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Tudo salvo até aqui.")).toBeInTheDocument()
  })

  it("validates on the client without calling the server when the form is empty", async () => {
    renderCreateForm()

    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }))

    expect(
      await screen.findByText("Informe o título do anúncio."),
    ).toBeInTheDocument()
    expect(screen.getByText("Selecione uma categoria.")).toBeInTheDocument()
    expect(screen.getByText("Selecione a condição do produto.")).toBeInTheDocument()
    expect(screen.getByText("Informe o preço do anúncio.")).toBeInTheDocument()
    expect(
      screen.getByText("Selecione o município do anúncio."),
    ).toBeInTheDocument()

    expect(actionMocks.createListingAction).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/^Título/)).toHaveAttribute(
      "aria-invalid",
      "true",
    )
  })

  it("sends normalized fields to the server", async () => {
    actionMocks.createListingAction.mockResolvedValue({ status: "idle" })
    renderCreateForm()

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText("Bairro"), {
      target: { value: "Nazaré" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }))

    await waitFor(() =>
      expect(actionMocks.createListingAction).toHaveBeenCalledTimes(1),
    )

    const [, formData] = actionMocks.createListingAction.mock.calls[0]
    expect(formData.get("intent")).toBe("draft")
    expect(formData.get("title")).toBe("iPhone 15 Pro")
    expect(formData.get("categoryId")).toBe(categoryId)
    expect(formData.get("condition")).toBe("like_new")
    expect(formData.get("price")).toBe("1.500,50")
    expect(formData.get("city")).toBe("Belém")
    expect(formData.get("neighborhood")).toBe("Nazaré")
    expect(formData.get("images")).toBe("[]")
    expect(formData.get("removedImagePaths")).toBeNull()
    expect(formData.get("listingId")).toBeNull()
  })

  it("blocks publishing without images before calling the server", async () => {
    renderCreateForm()

    fillRequiredFields()
    fireEvent.click(screen.getByRole("button", { name: "Publicar anúncio" }))

    expect(
      await screen.findByText(
        "Adicione pelo menos uma imagem para publicar o anúncio.",
      ),
    ).toBeInTheDocument()
    expect(actionMocks.createListingAction).not.toHaveBeenCalled()
  })

  it("warns about unsaved changes", () => {
    renderCreateForm()

    expect(screen.getByText("Tudo salvo até aqui.")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/^Título/), {
      target: { value: "Novo título" },
    })

    expect(
      screen.getByText("Você tem alterações não salvas."),
    ).toBeInTheDocument()
  })

  it("marks the form as dirty and sends the reordered image payload", async () => {
    actionMocks.updateListingAction.mockResolvedValue({ status: "idle" })
    render(
      <ListingForm
        mode="edit"
        userId={listingFixture.sellerId}
        categories={categories}
        listing={listingFixture}
      />,
    )

    expect(screen.getByText("Tudo salvo até aqui.")).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole("button", { name: "Mover Parte traseira para cima" }),
    )

    expect(
      screen.getByText("Você tem alterações não salvas."),
    ).toBeInTheDocument()
    expect(screen.queryByText("Tudo salvo até aqui.")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }))

    await waitFor(() =>
      expect(actionMocks.updateListingAction).toHaveBeenCalledTimes(1),
    )

    const [, formData] = actionMocks.updateListingAction.mock.calls[0]
    expect(JSON.parse(formData.get("images") as string)).toEqual([
      {
        storagePath: `${listingFixture.sellerId}/photo-2.png`,
        altText: "Parte traseira",
        sortOrder: 0,
        isPrimary: false,
      },
      {
        storagePath: `${listingFixture.sellerId}/photo-1.png`,
        altText: "Foto principal",
        sortOrder: 1,
        isPrimary: true,
      },
    ])
  })

  it("fills the edit form and sends the listingId", async () => {
    actionMocks.updateListingAction.mockResolvedValue({ status: "idle" })
    render(
      <ListingForm
        mode="edit"
        userId={listingFixture.sellerId}
        categories={categories}
        listing={listingFixture}
      />,
    )

    expect(
      screen.getByRole("heading", { level: 1, name: "Editar anúncio" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Rascunho")).toBeInTheDocument()
    expect(screen.getByLabelText(/^Título/)).toHaveValue(listingFixture.title)
    expect(screen.getByLabelText(/^Preço do anúncio/)).toHaveValue(
      formatEditablePrice(listingFixture.price),
    )
    expect(
      screen.getByRole("button", { name: "Salvar alterações" }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole("button", { name: "Salvar alterações" }),
    )

    await waitFor(() =>
      expect(actionMocks.updateListingAction).toHaveBeenCalledTimes(1),
    )

    const [, formData] = actionMocks.updateListingAction.mock.calls[0]
    expect(formData.get("intent")).toBe("save")
    expect(formData.get("listingId")).toBe(listingFixture.id)
  })

  it("sends the current image payload after removing an image", async () => {
    actionMocks.updateListingAction.mockResolvedValue({ status: "idle" })
    render(
      <ListingForm
        mode="edit"
        userId={listingFixture.sellerId}
        categories={categories}
        listing={listingFixture}
      />,
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Remover Parte traseira" }),
    )
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }))

    await waitFor(() =>
      expect(actionMocks.updateListingAction).toHaveBeenCalledTimes(1),
    )

    const [, formData] = actionMocks.updateListingAction.mock.calls[0]
    expect(JSON.parse(formData.get("images") as string)).toEqual([
      {
        storagePath: `${listingFixture.sellerId}/photo-1.png`,
        altText: "Foto principal",
        sortOrder: 0,
        isPrimary: true,
      },
    ])
    expect(formData.get("removedImagePaths")).toBeNull()
  })

  it("hides publishing for an already active listing", () => {
    const activeListing: Listing = { ...listingFixture, status: "active" }

    render(
      <ListingForm
        mode="edit"
        userId={listingFixture.sellerId}
        categories={categories}
        listing={activeListing}
      />,
    )

    expect(
      screen.queryByRole("button", { name: "Publicar anúncio" }),
    ).not.toBeInTheDocument()
    expect(screen.getByText("Publicado")).toBeInTheDocument()
  })

  it("displays the server error and the link to the saved listing", async () => {
    actionMocks.createListingAction.mockResolvedValue({
      status: "error",
      message:
        "Os dados do anúncio foram salvos, mas não foi possível atualizar as imagens.",
      listingId: listingFixture.id,
    })
    renderCreateForm()

    fillRequiredFields()
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }))

    expect(
      await screen.findByText(
        "Os dados do anúncio foram salvos, mas não foi possível atualizar as imagens.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Abrir anúncio salvo" }),
    ).toHaveAttribute("href", `/listings/${listingFixture.id}/edit`)
  })
})
