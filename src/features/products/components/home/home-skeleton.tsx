import { Skeleton } from "@/components/ui/skeleton"

/**
 * Estruturas de carregamento da home.
 *
 * Repetem a hierarquia visual das seções para reduzir o deslocamento de layout
 * enquanto os dados reais são buscados no servidor.
 */

export function CategoriesSectionSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="hidden h-5 w-40 sm:block" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
    </section>
  )
}

export function RecentListingsSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="space-y-3">
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-6 w-40 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-xl" />
        ))}
      </div>
    </section>
  )
}

export function HomeSkeleton() {
  return (
    <main aria-busy="true" aria-label="Carregando marketplace" className="flex-1">
      <p className="sr-only">Carregando anúncios e categorias do marketplace.</p>

      <section className="border-b border-border bg-card py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-7 w-72 max-w-full rounded-full" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-10 w-full max-w-2xl" />
            <Skeleton className="h-10 w-4/5 max-w-xl" />
          </div>
          <Skeleton className="mt-5 h-5 w-full max-w-xl" />
          <Skeleton className="mt-8 h-[4.5rem] w-full max-w-5xl rounded-2xl" />
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-28 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1320px] space-y-14 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <CategoriesSectionSkeleton />
        <RecentListingsSkeleton />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </main>
  )
}
