import { describe, expect, it } from "vitest"

import {
  DEFAULT_PAGE_SIZE,
  buildProductsHref,
  getActiveFilterCount,
  hasActiveFilters,
  parsePrice,
  parseProductFilters,
} from "../utils/query"

describe("parsePrice", () => {
  it("aceita formatos brasileiros e valores com moeda", () => {
    expect(parsePrice("1.000")).toBe(1000)
    expect(parsePrice("1.000,50")).toBe(1000.5)
    expect(parsePrice("R$ 4.500")).toBe(4500)
  })

  it("descarta valores vazios, inválidos ou negativos", () => {
    expect(parsePrice(null)).toBeNull()
    expect(parsePrice("")).toBeNull()
    expect(parsePrice("abc")).toBeNull()
    expect(parsePrice("-10")).toBeNull()
  })
})

describe("parseProductFilters", () => {
  it("normaliza os parâmetros válidos da URL", () => {
    const filters = parseProductFilters({
      q: "  iphone  ",
      category: "celulares",
      condition: "like_new",
      minPrice: "1000",
      maxPrice: "5000",
      location: "belem",
      sort: "price_asc",
      page: "2",
      pageSize: "24",
    })

    expect(filters).toEqual({
      q: "iphone",
      category: "celulares",
      condition: "like_new",
      minPrice: 1000,
      maxPrice: 5000,
      location: "belem",
      sort: "price_asc",
      page: 2,
      pageSize: 24,
    })
  })

  it("ignora valores inválidos e aplica os padrões", () => {
    const filters = parseProductFilters({
      category: "Categoria Inválida",
      condition: "broken",
      location: "marte",
      sort: "random",
      page: "0",
      pageSize: "999",
    })

    expect(filters.category).toBeNull()
    expect(filters.condition).toBeNull()
    expect(filters.location).toBeNull()
    expect(filters.sort).toBe("recent")
    expect(filters.page).toBe(1)
    expect(filters.pageSize).toBe(48)
    expect(filters.q).toBe("")
    expect(filters.minPrice).toBeNull()
    expect(filters.maxPrice).toBeNull()
  })

  it("inverte a faixa de preço quando o mínimo é maior que o máximo", () => {
    const filters = parseProductFilters({ minPrice: "5000", maxPrice: "1000" })

    expect(filters.minPrice).toBe(1000)
    expect(filters.maxPrice).toBe(5000)
  })

  it("limita o termo de busca e usa o primeiro valor de parâmetros repetidos", () => {
    const filters = parseProductFilters({
      q: ["primeiro", "segundo"],
      page: ["3", "4"],
    })

    expect(filters.q).toBe("primeiro")
    expect(filters.page).toBe(3)
  })

  it("limita a página máxima para evitar ranges absurdos", () => {
    expect(parseProductFilters({ page: "999999" }).page).toBe(10_000)
  })
})

describe("hasActiveFilters e getActiveFilterCount", () => {
  const baseFilters = parseProductFilters({})

  it("não considera filtros quando apenas a ordenação foi alterada", () => {
    expect(hasActiveFilters({ ...baseFilters, sort: "price_desc" })).toBe(false)
    expect(getActiveFilterCount({ ...baseFilters, sort: "price_desc" })).toBe(0)
  })

  it("conta busca, categoria, condição, preço e localização", () => {
    const filters = parseProductFilters({
      q: "iphone",
      category: "celulares",
      condition: "new",
      minPrice: "100",
      maxPrice: "500",
      location: "belem",
    })

    expect(hasActiveFilters(filters)).toBe(true)
    expect(getActiveFilterCount(filters)).toBe(6)
  })
})

describe("buildProductsHref", () => {
  it("omite valores padrão", () => {
    expect(buildProductsHref(parseProductFilters({}))).toBe("/products")
    expect(
      buildProductsHref(parseProductFilters({}), { page: 1, sort: "recent" }),
    ).toBe("/products")
  })

  it("preserva filtros ao trocar de página", () => {
    const filters = parseProductFilters({
      q: "iphone",
      category: "celulares",
      sort: "price_asc",
      page: "2",
    })

    const href = buildProductsHref(filters, { page: 3 })

    expect(href).toContain("q=iphone")
    expect(href).toContain("category=celulares")
    expect(href).toContain("sort=price_asc")
    expect(href).toContain("page=3")
  })

  it("permite limpar filtros com overrides nulos", () => {
    const filters = parseProductFilters({
      q: "iphone",
      category: "celulares",
    })

    const href = buildProductsHref(filters, {
      q: "",
      category: null,
      page: 1,
    })

    expect(href).toBe("/products")
  })

  it("inclui pageSize quando difere do padrão", () => {
    const filters = parseProductFilters({ pageSize: "24" })

    expect(filters.pageSize).not.toBe(DEFAULT_PAGE_SIZE)
    expect(buildProductsHref(filters)).toBe("/products?pageSize=24")
  })
})
