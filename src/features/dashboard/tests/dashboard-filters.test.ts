import { describe, expect, it } from "vitest"

import {
  buildDashboardHref,
  parseDashboardFilters,
} from "../utils/dashboard-filters"

describe("dashboard filters", () => {
  it("uses safe defaults for invalid status, sort, and page values", () => {
    expect(
      parseDashboardFilters({
        status: "removed",
        sort: "views",
        page: "0",
      }),
    ).toEqual({
      status: "all",
      query: "",
      sort: "recent",
      page: 1,
      pageSize: 6,
    })
  })

  it("parses supported filters and caps search length", () => {
    expect(
      parseDashboardFilters({
        status: "paused",
        q: "  cadeira  ",
        sort: "price_desc",
        page: "3",
      }),
    ).toEqual({
      status: "paused",
      query: "cadeira",
      sort: "price_desc",
      page: 3,
      pageSize: 6,
    })
  })

  it("preserves active filters in pagination links and resets to defaults", () => {
    const filters = {
      status: "active" as const,
      query: "bicicleta",
      sort: "price_asc" as const,
      page: 1,
      pageSize: 6,
    }

    expect(buildDashboardHref(filters, { page: 2 })).toBe(
      "/dashboard?status=active&q=bicicleta&sort=price_asc&page=2",
    )
    expect(
      buildDashboardHref(filters, { status: "all", query: "", page: 1 }),
    ).toBe("/dashboard?sort=price_asc")
  })
})
