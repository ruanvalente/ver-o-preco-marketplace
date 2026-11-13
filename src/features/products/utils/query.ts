import {
  PRODUCT_CONDITIONS,
  PRODUCT_SORTS,
  type ProductCondition,
  type ProductFilters,
  type ProductSort,
} from "../types/product.types"
import { LOCATION_OPTIONS } from "./catalog-options"

export const DEFAULT_PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 48
export const MAX_PAGE = 10_000

export type RawSearchParams = Record<
  string,
  string | string[] | undefined
>

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function isProductCondition(value: string): value is ProductCondition {
  return (PRODUCT_CONDITIONS as readonly string[]).includes(value)
}

function isProductSort(value: string): value is ProductSort {
  return (PRODUCT_SORTS as readonly string[]).includes(value)
}

function isCategorySlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

/**
 * Aceita valores como "1.000", "1.000,50" e "R$ 1.000".
 */
export function parsePrice(value: string | null): number | null {
  if (!value) {
    return null
  }

  const cleaned = value.replace(/[^\d,.-]/g, "")

  if (!cleaned) {
    return null
  }

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/\./g, "")

  const parsed = Number(normalized)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
  max: number,
): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }

  return Math.min(parsed, max)
}

/**
 * Traduz a query string do catálogo em filtros de domínio.
 *
 * A URL é a fonte de verdade da busca: os mesmos parâmetros podem ser
 * compartilhados, navegados pelo histórico e renderizados no servidor.
 */
export function parseProductFilters(
  searchParams: RawSearchParams,
): ProductFilters {
  const q = (firstValue(searchParams.q) ?? "").trim().slice(0, 120)

  const rawCategory = firstValue(searchParams.category)
  const category =
    rawCategory && isCategorySlug(rawCategory) ? rawCategory : null

  const rawCondition = firstValue(searchParams.condition)
  const condition =
    rawCondition && isProductCondition(rawCondition) ? rawCondition : null

  const rawLocation = firstValue(searchParams.location)
  const location =
    rawLocation && LOCATION_OPTIONS.some((option) => option.value === rawLocation)
      ? rawLocation
      : null

  const rawSort = firstValue(searchParams.sort)
  const sort = rawSort && isProductSort(rawSort) ? rawSort : "recent"

  let minPrice = parsePrice(firstValue(searchParams.minPrice))
  let maxPrice = parsePrice(firstValue(searchParams.maxPrice))

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    ;[minPrice, maxPrice] = [maxPrice, minPrice]
  }

  return {
    q,
    category,
    condition,
    minPrice,
    maxPrice,
    location,
    sort,
    page: parsePositiveInteger(
      firstValue(searchParams.page),
      1,
      MAX_PAGE,
    ),
    pageSize: parsePositiveInteger(
      firstValue(searchParams.pageSize),
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    ),
  }
}

export function hasActiveFilters(filters: ProductFilters): boolean {
  return Boolean(
    filters.q ||
      filters.category ||
      filters.condition ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.location,
  )
}

export function getActiveFilterCount(filters: ProductFilters): number {
  return [
    filters.q,
    filters.category,
    filters.condition,
    filters.minPrice !== null ? filters.minPrice : null,
    filters.maxPrice !== null ? filters.maxPrice : null,
    filters.location,
  ].filter((value) => value !== null && value !== "").length
}

/**
 * Monta a URL do catálogo preservando os filtros atuais.
 *
 * Parâmetros no valor padrão são omitidos para manter as URLs curtas.
 */
export function buildProductsHref(
  filters: ProductFilters,
  overrides: Partial<ProductFilters> = {},
): string {
  const merged: ProductFilters = { ...filters, ...overrides }
  const params = new URLSearchParams()

  if (merged.q.trim()) {
    params.set("q", merged.q.trim())
  }

  if (merged.category) {
    params.set("category", merged.category)
  }

  if (merged.condition) {
    params.set("condition", merged.condition)
  }

  if (merged.minPrice !== null) {
    params.set("minPrice", String(merged.minPrice))
  }

  if (merged.maxPrice !== null) {
    params.set("maxPrice", String(merged.maxPrice))
  }

  if (merged.location) {
    params.set("location", merged.location)
  }

  if (merged.sort !== "recent") {
    params.set("sort", merged.sort)
  }

  if (merged.page > 1) {
    params.set("page", String(merged.page))
  }

  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(merged.pageSize))
  }

  const query = params.toString()

  return query ? `/products?${query}` : "/products"
}

export const PRODUCTS_CATALOG_PATH = "/products"
