import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"

import { finalCtaTrustItems } from "../data/landing-content"

export function FinalCtaSection() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="relative overflow-hidden bg-primary-strong py-16 text-primary-foreground sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 size-80 -translate-y-1/2 rounded-full border border-primary-foreground/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-primary-foreground/10"
      />

      <div className="relative mx-auto flex w-full max-w-[1320px] flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <h2
          id="final-cta-title"
          className="max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
        >
          Pronto para fazer renda extra ou encontrar sua próxima oportunidade?
        </h2>

        <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
          Anuncie o que está parado ou encontre algo perto de você. O
          Ver-o-Preço é gratuito para começar.
        </p>

        <Button
          asChild
          size="lg"
          className="mt-8 h-12 bg-card px-6 text-base text-primary hover:bg-primary-muted focus-visible:ring-primary-foreground"
        >
          <Link href="/register">
            Quero anunciar meu produto
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-primary-foreground/80">
          {finalCtaTrustItems.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check aria-hidden="true" className="size-4" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
