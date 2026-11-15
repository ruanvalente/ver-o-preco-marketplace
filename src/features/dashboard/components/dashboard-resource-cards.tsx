import Link from "next/link"
import {
  ArrowRight,
  Handshake,
  MessageCircle,
  Sparkles,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { SellerDashboardData } from "../types/dashboard.types"

type DashboardResourceCardsProps = {
  data: SellerDashboardData
}

const resourceCardClassName =
  "group flex min-h-44 flex-col justify-between gap-5 rounded-xl border bg-card p-5 transition-colors hover:border-primary/30 focus-within:ring-2 focus-within:ring-ring/50"

export function DashboardResourceCards({
  data,
}: DashboardResourceCardsProps) {
  const unreadMessages = data.chatMetrics.ok
    ? data.chatMetrics.data.unreadMessageCount
    : null

  return (
    <section aria-labelledby="dashboard-resources-title" className="space-y-3">
      <h2 id="dashboard-resources-title" className="text-lg font-semibold">
        Mais para vender com tranquilidade
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="gap-0 py-0 shadow-none">
          <CardContent className="p-0">
            <Link href="/about" className={resourceCardClassName}>
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary-muted text-secondary">
                <Handshake aria-hidden="true" className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">Negocie de perto</span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Combine os detalhes da retirada presencial diretamente pelo
                  chat.
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Conheça o Ver-o-Preço
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0 shadow-none">
          <CardContent className="p-0">
            <Link href="/listings" className={resourceCardClassName}>
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-muted text-primary">
                <Sparkles aria-hidden="true" className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">Cuide dos seus anúncios</span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Revise fotos e informações para deixar cada anúncio mais
                  completo.
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Gerenciar anúncios
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0 shadow-none">
          <CardContent className="p-0">
            <Link href="/messages" className={resourceCardClassName}>
              <span className="flex size-10 items-center justify-center rounded-full bg-warning-surface text-warning-strong">
                <MessageCircle aria-hidden="true" className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">Central de mensagens</span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Acompanhe as conversas sobre os seus anúncios.
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                {unreadMessages === null
                  ? "Abrir mensagens"
                  : unreadMessages > 0
                    ? `${unreadMessages} não lidas`
                    : "Abrir mensagens"}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        Pacotes de destaque e relatórios mensais ainda não estão disponíveis.
      </p>
    </section>
  )
}
