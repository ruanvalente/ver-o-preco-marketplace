import { beforeEach, describe, expect, it, vi } from "vitest"

const { fromMock, createClientMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  createClientMock: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}))

// Outside a Server Component render React's `cache` is a pass-through. A small
// primitive-key memoizer lets this test exercise the request-level contract:
// equivalent ID sets must resolve to a single cached fetch.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()

  return {
    ...actual,
    cache: <R>(fn: (key: string) => R) => {
      const memo = new Map<string, R>()

      return (key: string): R => {
        if (memo.has(key)) {
          return memo.get(key) as R
        }

        const result = fn(key)
        memo.set(key, result)
        return result
      }
    },
  }
})

import { getFavoriteProductIds } from "../services/favorites.service"

const firstId = "11111111-1111-4111-8111-111111111111"
const secondId = "22222222-2222-4222-8222-222222222222"

type QueryMock = {
  select: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
}

function createQuery(): QueryMock {
  const query = {
    data: [{ product_id: firstId }],
    error: null,
    select: vi.fn(),
    in: vi.fn(),
  } as QueryMock

  query.select.mockReturnValue(query)
  query.in.mockReturnValue(query)

  return query
}

describe("getFavoriteProductIds", () => {
  let query: QueryMock

  beforeEach(() => {
    query = createQuery()
    fromMock.mockReturnValue(query)
    createClientMock.mockResolvedValue({ from: fromMock })
  })

  it("deduplica IDs equivalentes em uma única consulta por request", async () => {
    const [first, second] = await Promise.all([
      getFavoriteProductIds([firstId, secondId]),
      getFavoriteProductIds([secondId, firstId]),
    ])

    expect(first).toEqual({ ok: true, data: [firstId] })
    expect(second).toEqual(first)
    expect(fromMock).toHaveBeenCalledTimes(1)
    expect(query.select).toHaveBeenCalledWith("product_id")
    expect(query.in).toHaveBeenCalledWith("product_id", [firstId, secondId])
  })

  it("descarta IDs inválidos e repetidos", async () => {
    await getFavoriteProductIds([firstId, firstId, "not-a-uuid"])

    expect(query.in).toHaveBeenCalledWith("product_id", [firstId])
  })

  it("não consulta o banco quando nenhum ID é válido", async () => {
    await expect(getFavoriteProductIds(["not-a-uuid"])).resolves.toEqual({
      ok: true,
      data: [],
    })

    expect(fromMock).not.toHaveBeenCalled()
  })
})
