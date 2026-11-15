import { Eye, MessageCircle, Package, Store } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SellerDashboardData } from "../types/dashboard.types"

type DashboardMetricsProps = {
  data: SellerDashboardData
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  badge,
}: {
  title: string
  value: string
  description: string
  icon: typeof Package
  badge?: string
}) {
  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader className="flex grid-cols-[1fr_auto] items-start gap-3 px-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className="flex size-9 items-center justify-center rounded-full bg-primary-muted text-primary">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </CardHeader>
      <CardContent className="space-y-1 px-5">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {badge ? <Badge variant="outline">{badge}</Badge> : null}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function DashboardMetrics({ data }: DashboardMetricsProps) {
  const listingCounts = data.listings.ok ? data.listings.data.counts : null
  const chatMetrics = data.chatMetrics.ok ? data.chatMetrics.data : null
  const listingCount = listingCounts?.all

  return (
    <section aria-label="Resumo da sua conta" className="space-y-3">
      <h2 className="text-lg font-semibold">Resumo da sua conta</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total de anúncios"
          value={listingCount === undefined ? "—" : String(listingCount)}
          description={
            listingCounts
              ? "Todos os anúncios que você ainda gerencia."
              : "Não foi possível carregar esta métrica."
          }
          icon={Package}
        />
        <MetricCard
          title="Anúncios ativos"
          value={
            listingCounts ? String(listingCounts.active) : "—"
          }
          description={
            listingCounts
              ? `${listingCounts.sold} vendidos · ${listingCounts.paused} pausados`
              : "Não foi possível carregar esta métrica."
          }
          icon={Store}
        />
        <MetricCard
          title="Visualizações"
          value="—"
          description="O acompanhamento de visitas ainda não está disponível."
          icon={Eye}
        />
        <MetricCard
          title="Mensagens recebidas"
          value={
            chatMetrics ? String(chatMetrics.receivedMessageCount) : "—"
          }
          description={
            chatMetrics
              ? `${chatMetrics.conversationCount} conversas no total`
              : "Não foi possível carregar as conversas."
          }
          icon={MessageCircle}
          badge={
            chatMetrics && chatMetrics.unreadMessageCount > 0
              ? `${chatMetrics.unreadMessageCount} não lidas`
              : undefined
          }
        />
      </div>
      {!data.listings.ok || !data.chatMetrics.ok ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
        >
          <p>
            Algumas métricas estão indisponíveis no momento. Atualize para
            tentar novamente.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard">Tentar novamente</Link>
          </Button>
        </div>
      ) : null}
    </section>
  )
}
