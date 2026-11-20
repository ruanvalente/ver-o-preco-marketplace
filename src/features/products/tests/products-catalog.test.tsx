import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

import { ProductsCatalog } from "../components/catalog/products-catalog"
import {
  getProductCategories,
  getProducts,
} from "../services/products.service"
import type { ServiceResult } from "../types/product.types"
import type { ProductPage } from "../types/product.types"
import {
  categorySummaryFixture,
  productSummaryFixture,
} from "./fixtures"

vi.mock("../services/products.service", () => ({
  getProductCategories: vi.fn(),
  getProducts: vi.fn(),
}))

vi.mock("@/features/favorites/services/favorites.service", () => ({
  getFavoriteProductIds: vi.fn(async () => ({ ok: true, data: [] })),
}))

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>()
  return { ...actual, connection: vi.fn() }
})

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>()
  return { ...actual, useRouter: () => ({ push: vi.fn() }) }
})

vi.mock("@/features/favorites/services/favorites.actions", () => ({
  setFavoriteAction: vi.fn(async () => ({ ok: true })),
}))

const mockedGetCategories = vi.mocked(getProductCategories)
const mockedGetProducts = vi.mocked(getProducts)

function mockCatalog(result: ServiceResult<ProductPage>) {
  mockedGetCategories.mockResolvedValue({
    ok: true,
    data: [categorySummaryFixture],
  })

  mockedGetProducts.mockResolvedValue(result)
}

const populatedPage: ProductPage = {
  items: [productSummaryFixture],
  total: 13,
  page: 1,
  pageSize: 12,
  totalPages: 2,
}

const emptyPage: ProductPage = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 0,
}

describe("ProductsCatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("translates the URL into filters and renders the results", async () => {
    mockCatalog({ ok: true, data: populatedPage })

    render(
      await ProductsCatalog({
        searchParams: Promise.resolve({
          q: "iphone",
          category: "celulares",
          condition: "like_new",
          minPrice: "1000",
          maxPrice: "5000",
          location: "belem",
          sort: "price_asc",
          page: "2",
        }),
      }),
    )

    expect(mockedGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "iphone",
        category: "celulares",
        condition: "like_new",
        minPrice: 1000,
        maxPrice: 5000,
        location: "belem",
        sort: "price_asc",
        page: 2,
        pageSize: 12,
      }),
    )

    expect(screen.getByText(/13 anúncios/)).toBeInTheDocument()
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: productSummaryFixture.title,
      }),
    ).toBeInTheDocument()

    const secondPageLink = screen.getByRole("link", { name: "Página 2" })
    expect(secondPageLink.getAttribute("href")).toContain("page=2")
  })

  it("shows the empty state when filters return no listings", async () => {
    mockCatalog({ ok: true, data: emptyPage })

    render(
      await ProductsCatalog({
        searchParams: Promise.resolve({ q: "produto inexistente" }),
      }),
    )

    expect(
      screen.getByRole("heading", { name: "Nenhum anúncio encontrado" }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole("link", { name: "Limpar filtros" })[0],
    ).toHaveAttribute("href", "/products")
  })

  it("shows the catalog empty state when there are no filters", async () => {
    mockCatalog({ ok: true, data: emptyPage })

    render(await ProductsCatalog({ searchParams: Promise.resolve({}) }))

    expect(
      screen.getByRole("heading", { name: "Nenhum anúncio por aqui ainda" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Anunciar produto" }),
    ).toHaveAttribute("href", "/listings/new")
  })

  it("offers a way back when the requested page does not exist", async () => {
    mockCatalog({
      ok: true,
      data: { items: [], total: 13, page: 99, pageSize: 12, totalPages: 2 },
    })

    render(
      await ProductsCatalog({
        searchParams: Promise.resolve({ page: "99" }),
      }),
    )

    expect(
      screen.getByRole("heading", { name: "Esta página não existe" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Voltar para a primeira página" }),
    ).toHaveAttribute("href", "/products")
  })

  it("offers relevance sorting only when a term is present", async () => {
    mockCatalog({ ok: true, data: populatedPage })

    const withSearch = render(
      await ProductsCatalog({
        searchParams: Promise.resolve({ q: "iphone" }),
      }),
    )

    expect(
      screen.getByRole("link", { name: "Mais relevantes" }),
    ).toHaveAttribute("aria-current", "true")
    withSearch.unmount()

    mockCatalog({ ok: true, data: populatedPage })

    render(await ProductsCatalog({ searchParams: Promise.resolve({}) }))

    expect(
      screen.queryByRole("link", { name: "Mais relevantes" }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Mais recentes" }),
    ).toHaveAttribute("aria-current", "true")
  })

  it("shows a recoverable error when the query fails", async () => {
    mockCatalog({
      ok: false,
      error: "Não foi possível carregar os anúncios.",
    })

    render(await ProductsCatalog({ searchParams: Promise.resolve({}) }))

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os anúncios.",
    )
    expect(
      screen.getByRole("link", { name: "Tentar novamente" }),
    ).toHaveAttribute("href", "/products")
  })
})
