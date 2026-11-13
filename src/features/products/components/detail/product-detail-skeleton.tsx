import { Skeleton } from "@/components/ui/skeleton"

/**
 * Estrutura de carregamento do detalhe do anúncio.
 */
export function ProductDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando anúncio"
      className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12"
    >
      <p className="sr-only">Carregando informações do anúncio.</p>

      <div className="space-y-3">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="size-16 rounded-lg sm:size-20" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-56" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-10 rounded-md" />
      </div>
    </div>
  )
}
