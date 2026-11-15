import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { SellerDashboardData } from "../types/dashboard.types"
import { DashboardMetrics } from "../components/dashboard-metrics"

const data: SellerDashboardData = {
  profile: null,
  listings: {
    ok: true,
    data: {
      counts: { all: 8, draft: 1, active: 5, paused: 1, sold: 1 },
      page: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 6,
        totalPages: 1,
      },
    },
  },
  chatMetrics: {
    ok: true,
    data: {
      conversationCount: 3,
      receivedMessageCount: 8,
      unreadMessageCount: 2,
    },
  },
}

describe("DashboardMetrics", () => {
  it("renders current seller counts and labels untracked visits honestly", () => {
    render(<DashboardMetrics data={data} />)

    expect(screen.getByText("Total de anúncios")).toBeInTheDocument()
    expect(screen.getByText("Anúncios ativos")).toBeInTheDocument()
    expect(screen.getAllByText("8")).toHaveLength(2)
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("3 conversas no total")).toBeInTheDocument()
    expect(
      screen.getByText(
        "O acompanhamento de visitas ainda não está disponível.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByText("2 não lidas")).toBeInTheDocument()
  })

  it("offers a reload when a metrics source fails", () => {
    render(
      <DashboardMetrics
        data={{
          ...data,
          chatMetrics: { ok: false, error: "Internal error" },
        }}
      />,
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Algumas métricas estão indisponíveis",
    )
    expect(
      screen.getByRole("link", { name: "Tentar novamente" }),
    ).toHaveAttribute("href", "/dashboard")
  })
})
