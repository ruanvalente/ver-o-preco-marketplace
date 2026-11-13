import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

import { HeroSearchBar } from "./hero-search-bar"
import { QuickSuggestions } from "./quick-suggestions"

/**
 * Abertura da home: posicionamento regional, proposta de valor e busca.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-border bg-card py-12 sm:py-16 lg:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 size-[30rem] rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/4 size-80 rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Badge
          variant="outline"
          className="h-auto max-w-full shrink flex-wrap items-center gap-1.5 rounded-full border-border bg-background px-3 py-1.5 text-left text-label-sm font-medium whitespace-normal text-muted-foreground"
        >
          <MapPin aria-hidden="true" className="size-3.5 text-primary" />
          Marketplace ativo em 14+ municípios paraenses
          <span aria-hidden="true" className="text-border">
            •
          </span>
          Polo Belém
        </Badge>

        <h1
          id="hero-title"
          className="mt-6 max-w-4xl text-balance text-headline-xl-mobile font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-headline-xl"
        >
          <span className="block">Encontre o que você precisa.</span>
          <span className="block text-primary">
            Venda o que não usa no Pará.
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Compre e venda perto de você, com rapidez, simplicidade e segurança.
          Anúncios de gente da sua região, negociação direta e chat integrado
          para combinar tudo sem sair de casa.
        </p>

        <div className="max-w-5xl">
          <HeroSearchBar />
          <QuickSuggestions />
        </div>
      </div>
    </section>
  )
}
