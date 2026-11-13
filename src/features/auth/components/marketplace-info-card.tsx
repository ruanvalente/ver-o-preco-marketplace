import { Badge } from "@/components/ui/badge"

import { MARKETPLACE_HIGHLIGHTS } from "../data/login-content"
import { CommunityStats } from "./community-stats"
import { MarketplaceFeature } from "./marketplace-feature"

/**
 * Card institucional exibido ao lado do login em telas largas.
 * Abaixo de `lg`, ele continua visível na coluna única.
 */
export function MarketplaceInfoCard() {
  return (
    <section
      aria-labelledby="marketplace-info-title"
      className="flex h-full flex-col rounded-2xl border border-card/70 bg-linear-to-br from-primary-muted via-accent to-secondary-muted p-6 shadow-card sm:p-8 lg:p-10"
    >
      <Badge
        variant="outline"
        className="w-fit gap-1.5 border-transparent bg-card px-3 py-1 font-semibold text-success-strong shadow-card"
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
        Ecossistema Paraense
      </Badge>

      <h2
        id="marketplace-info-title"
        className="mt-6 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
      >
        Compre e venda com total segurança no Pará.
      </h2>

      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Uma praça digital desenvolvida especialmente para o dinamismo do comércio
        paraense, conectando ponta a ponta sem barreiras.
      </p>

      <ul className="mt-8 space-y-5">
        {MARKETPLACE_HIGHLIGHTS.map((feature) => (
          <MarketplaceFeature key={feature.title} feature={feature} />
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <CommunityStats />
      </div>
    </section>
  )
}
