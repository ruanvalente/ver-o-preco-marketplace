import { Skeleton } from "@/components/ui/skeleton"

import { ProductCardSkeleton } from "../product-card-skeleton"

/**
 * Estrutura de carregamento do catálogo, incluindo sidebar de filtros.
 */
export function ProductsCatalogSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando catálogo"
      className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10"
    >
      <p className="sr-only">Carregando filtros e anúncios do catálogo.</p>

      <aside className="hidden lg:block">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-6 w-24" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-64 rounded-full" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
