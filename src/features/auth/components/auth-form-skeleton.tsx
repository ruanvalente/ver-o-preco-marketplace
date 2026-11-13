import { Skeleton } from "@/components/ui/skeleton"

/**
 * Placeholder exibido enquanto a sessão é verificada no servidor.
 */
export function AuthFormSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <span role="status" className="sr-only">
        Carregando formulário…
      </span>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
    </div>
  )
}
