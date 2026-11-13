import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

import type { ProductFilters } from "../../types/product.types"
import { buildProductsHref } from "../../utils/query"

type ProductPaginationProps = {
  filters: ProductFilters
  totalPages: number
}

function getVisiblePages(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const result: (number | "gap")[] = []

  sorted.forEach((page, index) => {
    const previous = sorted[index - 1]

    if (previous && page - previous > 1) {
      result.push("gap")
    }

    result.push(page)
  })

  return result
}

/**
 * Paginação do catálogo baseada em links, preservando os filtros da URL.
 */
export function ProductPagination({
  filters,
  totalPages,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const current = Math.min(filters.page, totalPages)
  const pages = getVisiblePages(current, totalPages)
  const previousHref = buildProductsHref(filters, { page: current - 1 })
  const nextHref = buildProductsHref(filters, { page: current + 1 })

  const baseLinkClassName =
    "inline-flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="mt-10 flex flex-wrap items-center justify-center gap-1"
    >
      {current > 1 ? (
        <Link
          href={previousHref}
          rel="prev"
          aria-label="Página anterior"
          className={cn(
            baseLinkClassName,
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          aria-label="Página anterior indisponível"
          className={cn(baseLinkClassName, "cursor-not-allowed text-muted-foreground/40")}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </span>
      )}

      {pages.map((page, index) =>
        page === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="inline-flex size-10 items-center justify-center text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildProductsHref(filters, { page })}
            aria-current={page === current ? "page" : undefined}
            aria-label={`Página ${page}`}
            className={cn(
              baseLinkClassName,
              page === current
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {page}
          </Link>
        ),
      )}

      {current < totalPages ? (
        <Link
          href={nextHref}
          rel="next"
          aria-label="Próxima página"
          className={cn(
            baseLinkClassName,
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          aria-label="Próxima página indisponível"
          className={cn(baseLinkClassName, "cursor-not-allowed text-muted-foreground/40")}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </span>
      )}
    </nav>
  )
}
