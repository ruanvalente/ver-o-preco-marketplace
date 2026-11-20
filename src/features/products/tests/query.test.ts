import { describe, expect, it } from "vitest"

import {
  DEFAULT_PAGE_SIZE,
  buildProductsHref,
  getActiveFilterCount,
  getDefaultProductSort,
  hasActiveFilters,
  parsePrice,
  parseProductFilters,
} from "../utils/query"

describe("parsePrice", () => {
  it("accepts Brazilian formats and currency values", () => {
    expect(parsePrice("1.000")).toBe(1000)
    expect(parsePrice("1.000,50")).toBe(1000.5)
    expect(parsePrice("R$ 4.500")).toBe(4500)
  })

  it("discards empty, invalid or negative values", () => {
    expect(parsePrice(null)).toBeNull()
    expect(parsePrice("")).toBeNull()
    expect(parsePrice("abc")).toBeNull()
    expect(parsePrice("-10")).toBeNull()
  })
})

describe("getDefaultProductSort", () => {
  it("uses relevance with a term and recent without one", () => {
    expect(getDefaultProductSort("celular")).toBe("relevance")
    expect(getDefaultProductSort("  ")).toBe("recent")
    expect(getDefaultProductSort("")).toBe("recent")
  })
})

describe("parseProductFilters", () => {
  it("normalizes valid URL parameters", () => {
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

  it("ignores invalid values and applies defaults", () => {
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

  it("swaps the price range when the minimum is greater than the maximum", () => {
    const filters = parseProductFilters({ minPrice: "5000", maxPrice: "1000" })

    expect(filters.minPrice).toBe(1000)
    expect(filters.maxPrice).toBe(5000)
  })

  it("uses relevance as the default sort when searching", () => {
    expect(parseProductFilters({ q: "celular" }).sort).toBe("relevance")
    expect(parseProductFilters({ q: "celular", sort: "price_asc" }).sort).toBe(
      "price_asc",
    )
  })

  it("caps the search term and uses the first value of repeated parameters", () => {
    const filters = parseProductFilters({
      q: ["primeiro", "segundo"],
      page: ["3", "4"],
    })

    expect(filters.q).toBe("primeiro")
    expect(filters.page).toBe(3)
  })

  it("caps the maximum page to avoid absurd ranges", () => {
    expect(parseProductFilters({ page: "999999" }).page).toBe(10_000)
  })
})

describe("hasActiveFilters and getActiveFilterCount", () => {
  const baseFilters = parseProductFilters({})

  it("does not count filters when only sorting changed", () => {
    expect(hasActiveFilters({ ...baseFilters, sort: "price_desc" })).toBe(false)
    expect(getActiveFilterCount({ ...baseFilters, sort: "price_desc" })).toBe(0)
  })

  it("counts search, category, condition, price and location", () => {
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
  it("omits default values", () => {
    expect(buildProductsHref(parseProductFilters({}))).toBe("/products")
    expect(
      buildProductsHref(parseProductFilters({}), { page: 1, sort: "recent" }),
    ).toBe("/products")
  })

  it("omits relevance from the URL when it is the search default", () => {
    const filters = parseProductFilters({ q: "celular" })

    expect(buildProductsHref(filters)).toBe("/products?q=celular")
    expect(buildProductsHref(filters, { sort: "recent" })).toBe(
      "/products?q=celular&sort=recent",
    )
  })

  it("preserves filters when changing pages", () => {
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

  it("allows clearing filters with null overrides", () => {
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

  it("includes pageSize when it differs from the default", () => {
    const filters = parseProductFilters({ pageSize: "24" })

    expect(filters.pageSize).not.toBe(DEFAULT_PAGE_SIZE)
    expect(buildProductsHref(filters)).toBe("/products?pageSize=24")
  })
})
