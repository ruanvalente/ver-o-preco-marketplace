import Link from "next/link"
import { ArrowRight, Camera, MessageSquareText, Rocket } from "lucide-react"

import { Button } from "@/components/ui/button"

import { sellSteps } from "../../data/marketplace-content"

const stepIcons = [Camera, Rocket, MessageSquareText]

/**
 * Chamada para quem quer vender, com o fluxo em três passos.
 */
export function SellCtaBanner() {
  return (
    <section
      aria-labelledby="vender-title"
      className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--secondary-strong)_0%,var(--primary-strong)_100%)] text-secondary-foreground shadow-card"
    >
      <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-label-sm font-medium text-secondary-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
            Anunciar é grátis
          </p>

          <h2
            id="vender-title"
            className="mt-4 text-balance text-headline-lg-mobile font-bold tracking-tight sm:text-headline-lg"
          >
            Tem algo parado em casa?
            <span className="block text-secondary-fixed">
              Venda no Ver-o-Preço hoje mesmo.
            </span>
          </h2>

          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-secondary-fixed/90 sm:text-base">
            Transforme itens em desuso em renda extra. Publique o anúncio, receba
            mensagens de quem está por perto e combine a entrega direto com o
            comprador.
          </p>

          <Button
            asChild
            size="lg"
            className="mt-6 h-12 w-full bg-card px-6 text-base text-primary hover:bg-card/90 sm:w-auto"
          >
            <Link href="/register">
              Começar a desapegar grátis
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>

        <ol className="grid gap-3">
          {sellSteps.map((step, index) => {
            const Icon = stepIcons[index] ?? Camera

            return (
              <li
                key={step.title}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-secondary-strong"
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-secondary-foreground">
                    <span className="mr-1.5 text-secondary-fixed/80">
                      {index + 1}.
                    </span>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-body-sm text-secondary-fixed/85">
                    {step.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
