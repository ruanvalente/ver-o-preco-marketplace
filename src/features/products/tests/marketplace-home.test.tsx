import { describe, expect, it } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"

import { HeroSearchBar } from "../components/home/hero-search-bar"
import { PopularCategories } from "../components/home/popular-categories"
import { RecentListings } from "../components/home/recent-listings"
import { mapCategorySummaryToCategory } from "../utils/catalog-options"
import {
  categorySummaryFixture,
  productSummaryFixture,
  secondProductSummaryFixture,
} from "./fixtures"

describe("HeroSearchBar", () => {
  it("envia a busca para o catálogo público", () => {
    render(<HeroSearchBar />)

    const form = screen.getByRole("search", {
      name: "Buscar produtos no marketplace",
    })

    expect(form).toHaveAttribute("action", "/products")
    expect(form).toHaveAttribute("method", "get")
    expect(
      screen.getByRole("searchbox", { name: "O que você está procurando?" }),
    ).toHaveAttribute("name", "q")
    expect(
      screen.getByRole("combobox", { name: "Localização" }),
    ).toHaveAttribute("name", "location")
    expect(
      screen.getByRole("combobox", { name: "Categoria" }),
    ).toHaveAttribute("name", "category")
  })
})

describe("PopularCategories", () => {
  it("apresenta categorias com contagem e link para o catálogo", () => {
    render(
      <PopularCategories
        categories={[mapCategorySummaryToCategory(categorySummaryFixture)]}
      />,
    )

    expect(
      screen.getByRole("heading", { level: 2, name: "Categorias populares" }),
    ).toBeInTheDocument()

    const link = screen.getByRole("link", { name: /Celulares/i })

    expect(link).toHaveAttribute("href", "/products?category=celulares")
    expect(within(link).getByText("12 anúncios")).toBeInTheDocument()
  })

  it("exibe um estado vazio quando não há categorias", () => {
    render(<PopularCategories categories={[]} />)

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Categorias em preparação",
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Explorar anúncios" }),
    ).toHaveAttribute("href", "/products")
  })
})

describe("RecentListings", () => {
  it("apresenta os anúncios recentes com preço e localização", () => {
    render(
      <RecentListings
        products={[productSummaryFixture, secondProductSummaryFixture]}
        total={8}
      />,
    )

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Recém-publicados em Belém e Região",
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Ver todos (8)" }),
    ).toHaveAttribute("href", "/products")

    for (const product of [productSummaryFixture, secondProductSummaryFixture]) {
      expect(
        screen.getByRole("heading", { level: 3, name: product.title }),
      ).toBeInTheDocument()
    }

    expect(screen.getByText("R$ 4.500")).toBeInTheDocument()
    expect(screen.getByText("Belém - Nazaré")).toBeInTheDocument()
  })

  it("permite favoritar um anúncio no card", () => {
    render(
      <RecentListings products={[productSummaryFixture]} total={1} />,
    )

    const favoriteButton = screen.getByRole("button", {
      name: `Adicionar ${productSummaryFixture.title} aos favoritos`,
    })

    expect(favoriteButton).toHaveAttribute("aria-pressed", "false")

    fireEvent.click(favoriteButton)

    expect(
      screen.getByRole("button", {
        name: `Remover ${productSummaryFixture.title} dos favoritos`,
      }),
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("exibe um estado vazio quando não há anúncios", () => {
    render(<RecentListings products={[]} total={0} />)

    const section = screen.getByRole("region", {
      name: "Recém-publicados em Belém e Região",
    })

    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Nenhum anúncio por aqui ainda",
      }),
    ).toBeInTheDocument()
    expect(
      within(section).getByRole("link", { name: "Anunciar produto" }),
    ).toHaveAttribute("href", "/register")
  })
})
