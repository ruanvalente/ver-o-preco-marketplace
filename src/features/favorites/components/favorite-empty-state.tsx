import Link from "next/link"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FavoriteEmptyState({
  unavailableCount = 0,
}: {
  unavailableCount?: number
}) {
  const hasUnavailableFavorites = unavailableCount > 0

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-primary-muted text-primary"
      >
        <Heart className="size-7" />
      </span>

      <h2 className="mt-4 text-headline-sm font-semibold text-foreground">
        {hasUnavailableFavorites
          ? "Nenhum anúncio salvo está disponível"
          : "Você ainda não adicionou favoritos"}
      </h2>
      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        {hasUnavailableFavorites
          ? "Os anúncios salvos podem ter sido pausados ou removidos. Explore outros produtos perto de você."
          : "Toque no coração de um anúncio para guardar e encontrar por aqui depois."}
      </p>

      <Button asChild className="mt-6">
        <Link href="/products">Explorar produtos</Link>
      </Button>
    </div>
  )
}
