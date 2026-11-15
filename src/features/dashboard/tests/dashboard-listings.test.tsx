import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { listingSummaryFixture } from "@/features/listings/tests/fixtures"

vi.mock("@/features/listings/services/listing.actions", () => ({
  updateListingStatusAction: vi.fn(),
}))

import { DashboardListings } from "../components/dashboard-listings"
import type {
  OwnerListingDashboard,
  OwnerListingFilters,
} from "@/features/listings/types/listing.types"

const filters: OwnerListingFilters = {
  status: "all",
  query: "",
  sort: "recent",
  page: 1,
  pageSize: 6,
}

function dashboardData(
  overrides: Partial<OwnerListingDashboard> = {},
): OwnerListingDashboard {
  return {
    counts: { all: 8, draft: 1, active: 5, paused: 1, sold: 1 },
    page: {
      items: [listingSummaryFixture],
      total: 8,
      page: 1,
      pageSize: 6,
      totalPages: 2,
    },
    ...overrides,
  }
}

describe("DashboardListings", () => {
  it("shows owner listing data, status filters, actions, and real pagination", () => {
    render(
      <DashboardListings
        result={{ ok: true, data: dashboardData() }}
        filters={filters}
      />,
    )

    expect(screen.getByText("iPhone 15 Pro 256GB Titânio Natural")).toBeInTheDocument()
    expect(screen.getByText("R$ 4.500")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Ativos\s*5/ })).toHaveAttribute(
      "href",
      "/dashboard?status=active",
    )
    expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute(
      "href",
      `/listings/${listingSummaryFixture.id}/edit`,
    )
    expect(screen.getByRole("button", { name: /Pausar/ })).toBeInTheDocument()
    expect(screen.getByText("Mostrando 1 a 6 de 8 anúncios")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Próxima página" }),
    ).toHaveAttribute("href", "/dashboard?page=2")
  })

  it("distinguishes a status filter with no listings from a search with no results", () => {
    const emptyResult = {
      ok: true as const,
      data: dashboardData({
        page: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 6,
          totalPages: 1,
        },
      }),
    }

    const { rerender } = render(
      <DashboardListings
        result={emptyResult}
        filters={{ ...filters, status: "paused" }}
      />,
    )

    expect(
      screen.getByRole("heading", { name: "Você não tem anúncios pausados" }),
    ).toBeInTheDocument()

    rerender(
      <DashboardListings
        result={emptyResult}
        filters={{ ...filters, query: "mesa" }}
      />,
    )

    expect(
      screen.getByRole("heading", { name: "Nenhum anúncio encontrado" }),
    ).toBeInTheDocument()
  })

  it("shows a retry state when seller listings cannot be loaded", () => {
    render(
      <DashboardListings
        result={{ ok: false, error: "internal error" }}
        filters={filters}
      />,
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar seus anúncios.",
    )
    expect(
      screen.getByRole("link", { name: "Tentar novamente" }),
    ).toHaveAttribute("href", "/dashboard")
  })
})
