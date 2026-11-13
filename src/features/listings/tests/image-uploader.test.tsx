import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ImageUploader } from "../components/image-uploader"
import type { ManagedListingImage } from "../hooks/use-listing-images"
import { sellerId } from "./fixtures"

function managedImage(
  overrides: Partial<ManagedListingImage> = {},
): ManagedListingImage {
  return {
    id: "image-1",
    storagePath: `${sellerId}/photo-1.png`,
    url: "https://cdn.example.com/photo-1.png",
    altText: "Frente",
    isPrimary: true,
    status: "ready",
    persisted: true,
    ...overrides,
  }
}

function renderUploader(
  overrides: Partial<Parameters<typeof ImageUploader>[0]> = {},
) {
  const props = {
    images: [managedImage()],
    fileError: null,
    uploadProgress: null,
    isUploading: false,
    canAddMore: true,
    onFilesSelected: vi.fn(),
    onRetry: vi.fn(),
    onRemove: vi.fn(),
    onMove: vi.fn(),
    onSetPrimary: vi.fn(),
    onClearError: vi.fn(),
    ...overrides,
  }

  render(<ImageUploader {...props} />)

  return props
}

describe("ImageUploader", () => {
  it("associa o input de arquivo ao label e aceita múltiplas imagens", () => {
    renderUploader()

    const input = screen.getByLabelText("Imagens do anúncio")
    expect(input).toHaveAttribute("type", "file")
    expect(input).toHaveAttribute("multiple")
    expect(input).toHaveAttribute(
      "accept",
      "image/jpeg,image/jpg,image/png,image/webp",
    )
    expect(
      screen.getByText(/A primeira imagem \(ou a marcada como principal\)/),
    ).toBeInTheDocument()
  })

  it("encaminha os arquivos selecionados", () => {
    const { onFilesSelected } = renderUploader()
    const file = new File(["conteúdo"], "foto.png", { type: "image/png" })
    const input = screen.getByLabelText("Imagens do anúncio")

    fireEvent.change(input, { target: { files: [file] } })

    expect(onFilesSelected).toHaveBeenCalledWith([file])
  })

  it("desabilita o envio e anuncia o progresso durante o upload", () => {
    renderUploader({
      isUploading: true,
      uploadProgress: { total: 2, completed: 1 },
      images: [
        managedImage({
          id: "pending-1",
          url: "",
          storagePath: null,
          status: "uploading",
          persisted: false,
        }),
      ],
    })

    expect(screen.getByLabelText("Imagens do anúncio")).toBeDisabled()
    expect(
      screen.getByRole("progressbar", {
        name: "Progresso do envio de imagens",
      }),
    ).toHaveAttribute("aria-valuenow", "1")
    expect(screen.getByText("Enviando 1 de 2 imagens…")).toBeInTheDocument()
    expect(screen.getAllByText("Enviando…").length).toBeGreaterThan(0)
  })

  it("marca a imagem principal e permite trocar a principal", () => {
    const { onSetPrimary } = renderUploader({
      images: [
        managedImage(),
        managedImage({
          id: "image-2",
          storagePath: `${sellerId}/photo-2.png`,
          url: "https://cdn.example.com/photo-2.png",
          altText: "Traseira",
          isPrimary: false,
        }),
      ],
    })

    expect(screen.getAllByText("Principal").length).toBeGreaterThan(0)

    fireEvent.click(
      screen.getByRole("button", {
        name: "Definir Traseira como imagem principal",
      }),
    )

    expect(onSetPrimary).toHaveBeenCalledWith("image-2")
  })

  it("reordena com botões e desabilita as setas nos extremos", () => {
    const { onMove } = renderUploader({
      images: [
        managedImage(),
        managedImage({
          id: "image-2",
          altText: "Traseira",
          isPrimary: false,
        }),
      ],
    })

    expect(
      screen.getByRole("button", { name: "Mover Frente para cima" }),
    ).toBeDisabled()
    expect(
      screen.getByRole("button", { name: "Mover Traseira para baixo" }),
    ).toBeDisabled()

    fireEvent.click(
      screen.getByRole("button", { name: "Mover Frente para baixo" }),
    )
    expect(onMove).toHaveBeenCalledWith("image-1", 1)

    fireEvent.click(
      screen.getByRole("button", { name: "Mover Traseira para cima" }),
    )
    expect(onMove).toHaveBeenCalledWith("image-2", -1)
  })

  it("expõe remoção, erro de upload e nova tentativa", () => {
    const { onRemove, onRetry } = renderUploader({
      images: [
        managedImage({
          id: "pending-1",
          url: "",
          storagePath: null,
          altText: "",
          status: "error",
          error: "Falha no envio",
          persisted: false,
        }),
      ],
    })

    expect(screen.getByText("Sem prévia")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Falha no envio")

    fireEvent.click(
      screen.getByRole("button", { name: "Tentar enviar Imagem 1 novamente" }),
    )
    expect(onRetry).toHaveBeenCalledWith("pending-1")

    fireEvent.click(
      screen.getByRole("button", { name: "Remover Imagem 1" }),
    )
    expect(onRemove).toHaveBeenCalledWith("pending-1")
  })

  it("mostra o aviso de arquivo inválido e permite fechá-lo", () => {
    const { onClearError } = renderUploader({
      fileError: "A imagem deve ter no máximo 5 MB.",
      images: [],
    })

    expect(
      screen.getByText("A imagem deve ter no máximo 5 MB."),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Fechar aviso" }))
    expect(onClearError).toHaveBeenCalled()
  })

  it("informa o limite atingido e remove o input de arquivo", () => {
    renderUploader({
      canAddMore: false,
      images: Array.from({ length: 8 }, (_, index) =>
        managedImage({
          id: `image-${index}`,
          altText: `Foto ${index + 1}`,
          isPrimary: index === 0,
        }),
      ),
    })

    expect(
      screen.getByText(
        "Limite de 8 imagens atingido. Remova uma imagem para adicionar outra.",
      ),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText("Imagens do anúncio")).not.toBeInTheDocument()
  })
})
