import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

import { getListingsForOwner } from "../services/listing.service"
import { ListingCard } from "./listing-card"
import { ListingEmptyState } from "./listing-empty-state"
import { ListingErrorState } from "./listing-error-state"
import { ListingFeedback } from "./listing-feedback"

type ListingsPageProps = {
  userId: string
  feedback: {
    created?: string
    updated?: string
    deleted?: string
    error?: string
  }
}

/**
 * Área de gerenciamento dos anúncios do usuário.
 *
 * A leitura já é filtrada por `seller_id` no serviço e pela RLS. A página só
 * decide qual estado apresentar (lista, vazio ou erro) e mantém as ações de
 * ciclo de vida nos cards.
 */
export async function ListingsPage({ userId, feedback }: ListingsPageProps) {
  const result = await getListingsForOwner(userId)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-headline-lg-mobile font-bold tracking-tight text-foreground sm:text-headline-lg">
            Meus anúncios
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie, edite, publique e pause os produtos que você está vendendo.
          </p>
        </div>

        <Button asChild>
          <Link href="/listings/new">
            <Plus aria-hidden="true" className="size-4" />
            Criar anúncio
          </Link>
        </Button>
      </header>

      <ListingFeedback {...feedback} />

      {!result.ok ? (
        <ListingErrorState message={result.error} />
      ) : result.data.length === 0 ? (
        <ListingEmptyState />
      ) : (
        <section aria-label="Seus anúncios" className="space-y-4">
          {result.data.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </section>
      )}
    </div>
  )
}
