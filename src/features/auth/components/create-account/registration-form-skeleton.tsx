import { Skeleton } from "@/components/ui/skeleton"

/**
 * Placeholder do card de cadastro enquanto a sessão é verificada no servidor.
 */
export function RegistrationFormSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span role="status" className="sr-only">
        Carregando formulário de cadastro…
      </span>

      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-px flex-1" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-px flex-1" />
      </div>

      <div className="space-y-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>

      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}
