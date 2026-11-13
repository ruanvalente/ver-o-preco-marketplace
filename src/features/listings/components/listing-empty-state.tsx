import Link from "next/link"
import { PackageOpen, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Estado vazio da área de anúncios do usuário.
 */
export function ListingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-primary-muted text-primary"
      >
        <PackageOpen className="size-7" />
      </span>

      <h2 className="mt-4 text-headline-sm font-semibold text-foreground">
        Você ainda não tem anúncios
      </h2>

      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        Tem algo parado em casa? Publique seu primeiro anúncio e converse com
        quem está perto de você.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/listings/new">
            <Plus aria-hidden="true" className="size-4" />
            Criar anúncio
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Explorar produtos</Link>
        </Button>
      </div>
    </div>
  )
}
