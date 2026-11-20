import { beforeEach, describe, expect, it, vi } from "vitest"
import { cacheTag } from "next/cache"

import { parseProductFilters } from "../utils/query"

const { fromMock, rpcMock, getPublicUrlMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  rpcMock: vi.fn(),
  getPublicUrlMock: vi.fn(() => ({
    data: { publicUrl: "https://cdn.example.com/image.png" },
  })),
}))

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

vi.mock("@/lib/supabase/public", () => ({
  getPublicSupabaseClient: () => ({
    from: fromMock,
    rpc: rpcMock,
    storage: {
      from: () => ({ getPublicUrl: getPublicUrlMock }),
    },
  }),
}))

import { getProductById, getProducts } from "../services/products.service"

type QueryResult = {
  data: unknown
  error: unknown
  count?: number | null
}

type QueryMock = QueryResult & Record<string, ReturnType<typeof vi.fn>>

function createQuery(result: QueryResult): QueryMock {
  const query = {
    data: result.data,
    error: result.error,
    count: result.count ?? null,
  } as QueryMock

  for (const method of [
    "select",
    "eq",
    "gte",
    "lte",
    "in",
    "or",
    "order",
    "limit",
    "range",
    "maybeSingle",
  ]) {
    query[method] = vi.fn(() => query)
  }

  return query
}

const productId = "11111111-1111-4111-8111-111111111111"

const productRow = {
  id: productId,
  title: "iPhone 15 Pro",
  description: "Excelente estado.",
  price: "4500.00",
  condition: "like_new",
  city: "Belém",
  neighborhood: "Nazaré",
  created_at: "2026-10-29T12:00:00.000Z",
  category: { id: "category-1", slug: "celulares", name: "Celulares" },
  seller: {
    id: "seller-1",
    display_name: "Ana Souza",
    avatar_path: null,
    location: "Belém",
  },
  images: [
    {
      id: "image-1",
      storage_path: "/products/iphone.png",
      alt_text: "iPhone",
      sort_order: 0,
      is_primary: true,
    },
  ],
}

const searchRow = {
  id: productId,
  title: "iPhone 15 Pro",
  description: "Excelente estado.",
  price: "4500.00",
  condition: "like_new",
  city: "Belém",
  neighborhood: "Nazaré",
  created_at: "2026-10-29T12:00:00.000Z",
  category_id: "category-1",
  category_slug: "celulares",
  category_name: "Celulares",
  seller_id: "seller-1",
  seller_display_name: "Ana Souza",
  seller_avatar_path: null,
  seller_location: "Belém",
  primary_image_path: "/products/iphone.png",
  primary_image_alt: "iPhone",
  rank: 0.115,
  total_count: 1,
}

describe("products.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getProductById", () => {
    it("fetches only active products", async () => {
      const query = createQuery({ data: productRow, error: null })
      fromMock.mockReturnValue(query)

      const result = await getProductById(productId)

      expect(fromMock).toHaveBeenCalledWith("products")
      expect(query.eq).toHaveBeenCalledWith("id", productId)
      expect(query.eq).toHaveBeenCalledWith("status", "active")
      expect(cacheTag).toHaveBeenCalledWith("products:list")
      expect(result.ok).toBe(true)

      if (result.ok) {
        expect(result.data?.title).toBe("iPhone 15 Pro")
        expect(result.data?.image?.url).toBe("/products/iphone.png")
      }
    })

    it("returns null for missing or inactive products", async () => {
      const query = createQuery({ data: null, error: null })
      fromMock.mockReturnValue(query)

      await expect(getProductById(productId)).resolves.toEqual({
        ok: true,
        data: null,
      })
    })

    it("does not query the database when the id is not a UUID", async () => {
      await expect(getProductById("id-invalido")).resolves.toEqual({
        ok: true,
        data: null,
      })
      expect(fromMock).not.toHaveBeenCalled()
    })

    it("returns a safe error when the query fails", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const query = createQuery({ data: null, error: { message: "boom" } })
      fromMock.mockReturnValue(query)

      await expect(getProductById(productId)).resolves.toEqual({
        ok: false,
        error: "Não foi possível carregar este anúncio.",
      })

      consoleError.mockRestore()
    })
  })

  describe("getProducts", () => {
    it("uses an explicit select, with no wildcard columns", async () => {
      const query = createQuery({ data: [], error: null, count: 0 })
      fromMock.mockReturnValue(query)

      await getProducts(parseProductFilters({}))

      const select = query.select.mock.calls[0][0] as string
      expect(select).toContain("category:categories!")
      expect(select).toContain("seller:profiles!")
      expect(select).toContain("images:product_images")
      expect(select).not.toMatch(/(^|[\s,])\*(?=[\s,]|$)/)
    })

    it("filters by active status and builds the page", async () => {
      const query = createQuery({ data: [productRow], error: null, count: 1 })
      fromMock.mockReturnValue(query)

      const result = await getProducts(parseProductFilters({}))

      expect(query.eq).toHaveBeenCalledWith("status", "active")
      expect(query.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      })
      expect(query.range).toHaveBeenCalledWith(0, 11)
      expect(result).toEqual({
        ok: true,
        data: {
          items: [
            expect.objectContaining({
              id: productId,
              title: "iPhone 15 Pro",
            }),
          ],
          total: 1,
          page: 1,
          pageSize: 12,
          totalPages: 1,
        },
      })
    })

    it("applies condition, price range, location and sorting", async () => {
      const query = createQuery({ data: [], error: null, count: 0 })
      fromMock.mockReturnValue(query)

      await getProducts(
        parseProductFilters({
          condition: "new",
          minPrice: "100",
          maxPrice: "900",
          location: "belem",
          sort: "price_desc",
          page: "2",
        }),
      )

      expect(query.eq).toHaveBeenCalledWith("condition", "new")
      expect(query.gte).toHaveBeenCalledWith("price", 100)
      expect(query.lte).toHaveBeenCalledWith("price", 900)
      expect(query.in).toHaveBeenCalledWith("city", [
        "Belém",
        "Ananindeua",
        "Marituba",
      ])
      expect(query.order).toHaveBeenCalledWith("price", { ascending: false })
      expect(query.range).toHaveBeenCalledWith(12, 23)
    })

    it("uses the full-text search RPC when a term is present", async () => {
      rpcMock.mockResolvedValue({ data: [searchRow], error: null })

      const result = await getProducts(
        parseProductFilters({
          q: "iphone",
          category: "celulares",
          condition: "new",
          minPrice: "100",
          maxPrice: "9000",
          location: "belem",
          sort: "relevance",
          page: "2",
          pageSize: "24",
        }),
      )

      expect(rpcMock).toHaveBeenCalledWith("search_products", {
        p_search_term: "iphone",
        p_category_slug: "celulares",
        p_min_price: 100,
        p_max_price: 9000,
        p_cities: ["Belém", "Ananindeua", "Marituba"],
        p_condition: "new",
        p_limit: 24,
        p_offset: 24,
        p_sort: "relevance",
      })
      expect(fromMock).not.toHaveBeenCalled()
      expect(result).toEqual({
        ok: true,
        data: {
          items: [
            expect.objectContaining({
              id: productId,
              title: "iPhone 15 Pro",
              category: { id: "category-1", slug: "celulares", name: "Celulares" },
            }),
          ],
          total: 1,
          page: 2,
          pageSize: 24,
          totalPages: 1,
        },
      })
    })

    it("does not use ILIKE and normalizes syntax characters in the search term", async () => {
      const query = createQuery({ data: [], error: null, count: 0 })
      fromMock.mockReturnValue(query)
      rpcMock.mockResolvedValue({ data: [], error: null })

      await getProducts(parseProductFilters({ q: "iphone' | %_" }))

      expect(rpcMock).toHaveBeenCalledWith(
        "search_products",
        expect.objectContaining({ p_search_term: "iphone' | %_" }),
      )
      expect(query.or).not.toHaveBeenCalled()
    })

    it("returns a safe error when the search RPC fails", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } })

      await expect(
        getProducts(parseProductFilters({ q: "iphone" })),
      ).resolves.toEqual({
        ok: false,
        error: "Não foi possível carregar os anúncios.",
      })

      consoleError.mockRestore()
    })

    it("rejects partially malformed responses or an invalid total", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)

      rpcMock.mockResolvedValue({ data: [searchRow, { id: "invalido" }], error: null })
      await expect(
        getProducts(parseProductFilters({ q: "iphone" })),
      ).resolves.toEqual({
        ok: false,
        error: "Não foi possível carregar os anúncios.",
      })

      rpcMock.mockResolvedValue({
        data: [{ ...searchRow, total_count: "abc" }],
        error: null,
      })
      await expect(
        getProducts(parseProductFilters({ q: "iphone" })),
      ).resolves.toEqual({
        ok: false,
        error: "Não foi possível carregar os anúncios.",
      })

      consoleError.mockRestore()
    })

    it("returns a safe error when the query fails", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const query = createQuery({ data: null, error: { message: "boom" } })
      fromMock.mockReturnValue(query)

      await expect(getProducts(parseProductFilters({}))).resolves.toEqual({
        ok: false,
        error: "Não foi possível carregar os anúncios.",
      })

      consoleError.mockRestore()
    })
  })
})
