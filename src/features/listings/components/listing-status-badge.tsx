import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { ListingStatus } from "../types/listing.types"

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Rascunho",
  active: "Publicado",
  paused: "Pausado",
  sold: "Vendido",
  removed: "Removido",
}

const STATUS_CLASSES: Record<ListingStatus, string> = {
  draft: "border-border bg-muted text-muted-foreground",
  active: "border-primary/20 bg-primary-muted text-primary",
  paused: "border-warning/20 bg-warning-surface text-warning-strong",
  sold: "border-success/20 bg-success-surface text-success-strong",
  removed: "border-destructive/20 bg-destructive/10 text-destructive",
}

type ListingStatusBadgeProps = {
  status: ListingStatus
  className?: string
}

/**
 * Badge de status do anúncio.
 *
 * O status nunca é deduzido no componente: ele vem do modelo de domínio já
 * mapeado pelo serviço de listings.
 */
export function ListingStatusBadge({
  status,
  className,
}: ListingStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-1 text-badge-label",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {LISTING_STATUS_LABELS[status]}
    </Badge>
  )
}
