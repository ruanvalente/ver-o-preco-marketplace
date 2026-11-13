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

  it("traduz a URL em filtros e apresenta os resultados", async () => {
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

  it("exibe o estado vazio quando os filtros não retornam anúncios", async () => {
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

  it("exibe o estado vazio do catálogo quando não há filtros", async () => {
    mockCatalog({ ok: true, data: emptyPage })

    render(await ProductsCatalog({ searchParams: Promise.resolve({}) }))

    expect(
      screen.getByRole("heading", { name: "Nenhum anúncio por aqui ainda" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Anunciar produto" }),
    ).toHaveAttribute("href", "/listings/new")
  })

  it("oferece retorno quando a página pedida não existe", async () => {
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

  it("exibe um erro recuperável quando a consulta falha", async () => {    mockCatalog({
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
