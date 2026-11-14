import Link from "next/link"
import { ChartNoAxesColumn, MapPin, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"

import { DashboardListings } from "./dashboard-listings"
import { DashboardMetrics } from "./dashboard-metrics"
import { DashboardResourceCards } from "./dashboard-resource-cards"
import { DashboardTrustCard } from "./dashboard-trust-card"
import type {
  DashboardFeedback,
  DashboardFilters,
  SellerDashboardData,
} from "../types/dashboard.types"

type SellerDashboardProps = {
  data: SellerDashboardData
  email: string | null
  filters: DashboardFilters
  feedback: DashboardFeedback
}

const SUCCESS_MESSAGES: Record<string, string> = {
  published: "Anúncio publicado! Ele já aparece no marketplace.",
  paused: "Anúncio pausado. Você pode reativá-lo quando quiser.",
  deleted: "Anúncio excluído.",
}

export function SellerDashboard({
  data,
  email,
  filters,
  feedback,
}: SellerDashboardProps) {
  const displayName =
    data.profile?.displayName?.trim() || email?.split("@")[0] || "vendedor"
  const location = data.profile?.location?.trim()

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {location ? (
              <Badge
                variant="outline"
                className="gap-1.5 border-secondary/20 bg-secondary-muted text-secondary-strong"
              >
                <MapPin aria-hidden="true" className="size-3.5" />
                {location}
              </Badge>
            ) : null}
            <Badge variant="outline">Painel do vendedor</Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-headline-lg-mobile font-bold tracking-tight text-foreground sm:text-headline-lg">
              Olá, {displayName}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Acompanhe seus anúncios e conversas em um só lugar.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div>
            <Button
              type="button"
              variant="outline"
              disabled
              aria-describedby="monthly-report-unavailable"
              className="min-h-11"
            >
              <ChartNoAxesColumn aria-hidden="true" className="size-4" />
              Relatório mensal
            </Button>
            <p id="monthly-report-unavailable" className="mt-1 max-w-52 text-xs text-muted-foreground">
              Disponível quando houver histórico de métricas.
            </p>
          </div>
          <Button asChild className="min-h-11">
            <Link href="/listings/new">
              <Plus aria-hidden="true" className="size-4" />
              Criar novo anúncio
            </Link>
          </Button>
        </div>
      </header>

      {feedback.updated && SUCCESS_MESSAGES[feedback.updated] ? (
        <Alert role="status">
          <p>{SUCCESS_MESSAGES[feedback.updated]}</p>
        </Alert>
      ) : null}

      <DashboardMetrics data={data} />
      <DashboardTrustCard />
      <DashboardListings
        result={data.listings}
        filters={filters}
        actionError={feedback.error}
        retryListingId={feedback.listingId}
      />
      <DashboardResourceCards data={data} />
    </div>
  )
}
