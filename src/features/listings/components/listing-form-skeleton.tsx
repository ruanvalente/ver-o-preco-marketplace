import { Skeleton } from "@/components/ui/skeleton"

/**
 * Estrutura de carregamento do formulário de anúncio.
 *
 * Mantém a mesma largura e os mesmos blocos do formulário real para reduzir
 * deslocamento visual quando os dados chegam.
 */
export function ListingFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6" aria-busy="true">
      <span role="status" className="sr-only">
        Carregando formulário do anúncio…
      </span>
      <Skeleton className="h-4 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-52 w-full rounded-2xl" />
    </div>
  )
}
