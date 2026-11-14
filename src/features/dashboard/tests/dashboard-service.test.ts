import { beforeEach, describe, expect, it, vi } from "vitest"

const supabaseMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  storageFrom: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: supabaseMocks.createClient,
}))

import { getOwnerListingDashboard } from "@/features/listings/services/listing.service"
import { categoryId, listingId, sellerId } from "@/features/listings/tests/fixtures"

type QueryResult = {
  data: unknown
  error: unknown
  count?: number
}

type Query = {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  neq: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  range: ReturnType<typeof vi.fn>
  or: ReturnType<typeof vi.fn>
  ilike: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  then: (
    onFulfilled: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise<unknown>
}

function makeQuery(result: QueryResult): Query {
  const query = {} as Query
  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected)

  for (const method of [
    "select",
    "eq",
    "neq",
    "order",
    "range",
    "or",
    "ilike",
    "limit",
  ] as const) {
    query[method] = vi.fn(() => query)
  }

  return query
}

const filters = {
  status: "all" as const,
  query: "",
  sort: "recent" as const,
  page: 2,
  pageSize: 6,
}

let productQueries: Query[] = []

describe("getOwnerListingDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    productQueries = []
    const listingRow = {
      id: listingId,
      seller_id: sellerId,
      title: "Bicicleta urbana",
      description: "",
      price: 600,
      condition: "good",
      city: "Belém",
      neighborhood: null,
      status: "active",
      created_at: "2026-11-10T12:00:00.000Z",
      updated_at: "2026-11-10T12:00:00.000Z",
      category: { id: categoryId, slug: "bicicletas", name: "Bicicletas" },
      images: [],
    }

    supabaseMocks.from.mockImplementation((table: string) => {
      const query = makeQuery(
        table === "products"
          ? {
              data: [listingRow],
              error: null,
              count: 8,
            }
          : { data: null, error: null, count: 0 },
      )

      if (table === "products") {
        productQueries.push(query)
      }

      return query
    })
    supabaseMocks.createClient.mockResolvedValue({
      from: supabaseMocks.from,
      storage: {
        from: supabaseMocks.storageFrom,
      },
    })
    supabaseMocks.storageFrom.mockReturnValue({
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://cdn.example.com/${path}` },
      }),
    })
  })

  it("scopes every listing count and page to the owner and returns a real page", async () => {
    const result = await getOwnerListingDashboard(sellerId, filters)

    expect(result.ok).toBe(true)
    expect(supabaseMocks.from).toHaveBeenCalledTimes(6)

    for (const query of productQueries) {
      expect(query.eq).toHaveBeenCalledWith("seller_id", sellerId)
      expect(query.neq).toHaveBeenCalledWith("status", "removed")
    }

    if (result.ok) {
      expect(result.data.page).toMatchObject({
        total: 8,
        page: 2,
        pageSize: 6,
        totalPages: 2,
      })
      expect(result.data.page.items[0].title).toBe("Bicicleta urbana")
    }
  })
})
