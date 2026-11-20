import Link from "next/link"
import { ArrowDownWideNarrow } from "lucide-react"

import { cn } from "@/lib/utils"

import type { ProductFilters } from "../../types/product.types"
import { PRODUCT_SORT_OPTIONS } from "../../utils/catalog-options"
import { buildProductsHref, getDefaultProductSort } from "../../utils/query"

type ProductSortLinksProps = {
  filters: ProductFilters
}

/**
 * Ordenação do catálogo representada na URL.
 *
 * Links nativos mantêm a navegação acessível e funcionam sem JavaScript.
 */
export function ProductSortLinks({ filters }: ProductSortLinksProps) {
  // Relevância só faz sentido quando há termo; sem busca ela repetiria
  // "Mais recentes" e deixaria a barra sem opção ativa.
  const options =
    getDefaultProductSort(filters.q) === "relevance"
      ? PRODUCT_SORT_OPTIONS
      : PRODUCT_SORT_OPTIONS.filter((option) => option.value !== "relevance")

  return (
    <nav
      aria-label="Ordenar anúncios"
      className="flex items-center gap-1 overflow-x-auto"
    >
      <ArrowDownWideNarrow
        aria-hidden="true"
        className="mr-1 size-4 shrink-0 text-muted-foreground"
      />

      {options.map((option) => {
        const isActive = filters.sort === option.value

        return (
          <Link
            key={option.value}
            href={buildProductsHref(filters, {
              sort: option.value,
              page: 1,
            })}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isActive
                ? "bg-primary-muted text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {option.label}
          </Link>
        )
      })}
    </nav>
  )
}
