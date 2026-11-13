import Link from "next/link"
import { PackageSearch, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"

type ProductEmptyStateProps = {
  hasFilters?: boolean
  resetHref?: string
}

/**
 * Estado vazio do catálogo.
 *
 * Diferencia a ausência total de anúncios da ausência de resultados para os
 * filtros aplicados.
 */
export function ProductEmptyState({
  hasFilters = false,
  resetHref = "/products",
}: ProductEmptyStateProps) {
  const Icon = hasFilters ? SearchX : PackageSearch

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-primary-muted text-primary"
      >
        <Icon className="size-7" />
      </span>

      <h2 className="mt-4 text-headline-sm font-semibold text-foreground">
        {hasFilters ? "Nenhum anúncio encontrado" : "Nenhum anúncio por aqui ainda"}
      </h2>

      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        {hasFilters
          ? "Tente ajustar a busca, a categoria ou a faixa de preço para encontrar mais anúncios."
          : "Seja a primeira pessoa a publicar na sua região. Anunciar é grátis e leva poucos minutos."}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {hasFilters ? (
          <Button asChild>
            <Link href={resetHref}>Limpar filtros</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/listings/new">Anunciar produto</Link>
          </Button>
        )}

        <Button asChild variant="outline">
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    </div>
  )
}
