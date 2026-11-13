import Link from "next/link"
import { Eye, PauseCircle, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductImage } from "@/features/products/components/product-image"
import { CONDITION_LABELS } from "@/features/products/utils/catalog-options"
import { formatPrice } from "@/features/products/utils/format"

import { updateListingStatusAction } from "../services/listing.actions"
import type { ListingSummary } from "../types/listing.types"
import { formatListingDate } from "../utils/format"
import { ListingDeleteDialog } from "./listing-delete-dialog"
import { ListingStatusBadge } from "./listing-status-badge"

type ListingCardProps = {
  listing: ListingSummary
}

/**
 * Card de gerenciamento de um anúncio próprio.
 *
 * Mostra o mesmo resumo do catálogo público, mas expõe apenas ações do
 * proprietário. Ações de status são formulários nativos para funcionarem sem
 * JavaScript adicional.
 */
export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.image
  const canPublish = listing.status === "draft" || listing.status === "paused"

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:p-5">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:aspect-square sm:w-36">
        {image ? (
          <ProductImage
            src={image.url}
            alt={image.alt}
            sizes="(min-width: 640px) 144px, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={`${listing.title} sem imagem disponível`}
            className="flex size-full items-center justify-center bg-muted px-2 text-center text-label-sm text-muted-foreground"
          >
            Sem imagem
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ListingStatusBadge status={listing.status} />
          <span className="text-label-sm text-muted-foreground">
            {listing.category.name}
          </span>
        </div>

        <h2 className="line-clamp-2 text-headline-sm font-semibold text-foreground">
          {listing.title}
        </h2>

        <p className="text-price-display text-primary">
          {formatPrice(listing.price)}
        </p>

        <p className="text-sm text-muted-foreground">
          {listing.location.label} • {CONDITION_LABELS[listing.condition]}
        </p>

        <p className="text-label-sm text-muted-foreground">
          Atualizado em {formatListingDate(listing.updatedAt)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/listings/${listing.id}/edit`}>Editar</Link>
          </Button>

          {listing.status === "active" ? (
            <Button asChild size="sm" variant="ghost">
              <Link href={`/products/${listing.id}`}>
                <Eye aria-hidden="true" className="size-4" />
                Ver anúncio
              </Link>
            </Button>
          ) : null}

          {canPublish ? (
            <form action={updateListingStatusAction}>
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="intent" value="publish" />
              <Button type="submit" size="sm" variant="ghost">
                <Send aria-hidden="true" className="size-4" />
                Publicar
              </Button>
            </form>
          ) : null}

          {listing.status === "active" ? (
            <form action={updateListingStatusAction}>
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="intent" value="pause" />
              <Button type="submit" size="sm" variant="ghost">
                <PauseCircle aria-hidden="true" className="size-4" />
                Pausar
              </Button>
            </form>
          ) : null}

          <ListingDeleteDialog
            listingId={listing.id}
            listingTitle={listing.title}
          />
        </div>
      </div>
    </article>
  )
}
