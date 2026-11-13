import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

type ListingErrorStateProps = {
  message?: string
  retryHref?: string
}

/**
 * Estado de erro recuperável da área de anúncios.
 *
 * Nunca expõe detalhes do Supabase; oferece uma nova tentativa e uma saída
 * clara para o catálogo.
 */
export function ListingErrorState({
  message = "Não foi possível carregar seus anúncios.",
  retryHref = "/listings",
}: ListingErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-card px-6 py-16 text-center"
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
      >
        <AlertCircle className="size-7" />
      </span>

      <h2 className="mt-4 text-headline-sm font-semibold text-foreground">
        Algo deu errado
      </h2>

      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        {message} Tente novamente em instantes.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={retryHref}>Tentar novamente</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Explorar produtos</Link>
        </Button>
      </div>
    </div>
  )
}
