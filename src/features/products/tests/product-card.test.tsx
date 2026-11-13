import { describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

import { ProductCard } from "../components/product-card"
import {
  productSummaryFixture,
  secondProductSummaryFixture,
} from "./fixtures"

describe("ProductCard", () => {
  it("apresenta imagem, preço, título, localização e condição", () => {
    render(<ProductCard product={productSummaryFixture} />)

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: productSummaryFixture.title,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText("R$ 4.500")).toBeInTheDocument()
    expect(screen.getByText("Belém - Nazaré")).toBeInTheDocument()
    expect(screen.getByText("Seminovo")).toBeInTheDocument()
    expect(
      screen.getByRole("img", {
        name: "iPhone 15 Pro na cor titânio natural",
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole("link", {
        name: `Ver detalhes de ${productSummaryFixture.title}`,
      }),
    ).toHaveAttribute("href", `/products/${productSummaryFixture.id}`)
  })

  it("exibe um marcador quando o anúncio não tem imagem", () => {
    render(<ProductCard product={secondProductSummaryFixture} />)

    expect(
      screen.getByRole("img", {
        name: `${secondProductSummaryFixture.title} sem imagem disponível`,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText("Sem imagem")).toBeInTheDocument()
  })

  it("usa o placeholder quando a imagem falha ao carregar", () => {
    render(<ProductCard product={productSummaryFixture} />)

    fireEvent.error(
      screen.getByRole("img", {
        name: "iPhone 15 Pro na cor titânio natural",
      }),
    )

    expect(
      screen.getByRole("img", {
        name: "iPhone 15 Pro na cor titânio natural indisponível",
      }),
    ).toBeInTheDocument()
    expect(screen.getByText("Sem imagem")).toBeInTheDocument()
  })

  it("permite favoritar o anúncio", () => {
    render(<ProductCard product={productSummaryFixture} />)

    const favoriteButton = screen.getByRole("button", {
      name: `Adicionar ${productSummaryFixture.title} aos favoritos`,
    })

    fireEvent.click(favoriteButton)

    expect(
      screen.getByRole("button", {
        name: `Remover ${productSummaryFixture.title} dos favoritos`,
      }),
    ).toHaveAttribute("aria-pressed", "true")
  })
})
