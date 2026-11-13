import { beforeEach, describe, expect, it, vi } from "vitest"

import { parseProductFilters } from "../utils/query"

const { fromMock, getPublicUrlMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
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

describe("products.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getProductById", () => {
    it("busca apenas produtos ativos", async () => {
      const query = createQuery({ data: productRow, error: null })
      fromMock.mockReturnValue(query)

      const result = await getProductById(productId)

      expect(fromMock).toHaveBeenCalledWith("products")
      expect(query.eq).toHaveBeenCalledWith("id", productId)
      expect(query.eq).toHaveBeenCalledWith("status", "active")
      expect(result.ok).toBe(true)

      if (result.ok) {
        expect(result.data?.title).toBe("iPhone 15 Pro")
        expect(result.data?.image?.url).toBe("/products/iphone.png")
      }
    })

    it("retorna null para produtos inexistentes ou inativos", async () => {
      const query = createQuery({ data: null, error: null })
      fromMock.mockReturnValue(query)

      await expect(getProductById(productId)).resolves.toEqual({
        ok: true,
        data: null,
      })
    })

    it("não consulta o banco quando o id não é um UUID", async () => {
      await expect(getProductById("id-invalido")).resolves.toEqual({
        ok: true,
        data: null,
      })
      expect(fromMock).not.toHaveBeenCalled()
    })

    it("retorna um erro seguro quando a consulta falha", async () => {
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
    it("filtra por status ativo e monta a página", async () => {
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

    it("aplica condição, faixa de preço, localização e ordenação", async () => {
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

    it("sanitiza o termo de busca antes de montar o filtro", async () => {
      const query = createQuery({ data: [], error: null, count: 0 })
      fromMock.mockReturnValue(query)

      await getProducts(parseProductFilters({ q: "iphone, %_ (x)" }))

      expect(query.or).toHaveBeenCalledWith(
        "title.ilike.%iphone x%,description.ilike.%iphone x%",
      )
    })

    it("retorna um erro seguro quando a consulta falha", async () => {
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
