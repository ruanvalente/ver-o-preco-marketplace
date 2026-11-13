import { MapPin, Megaphone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LandingPole } from "../../types/landing.types"

import { IconTile } from "./icon-tile"

type PoleCardProps = {
  pole: LandingPole
}

export function PoleCard({ pole }: PoleCardProps) {
  const isActive = pole.status === "Ativo"

  return (
    <article className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card">
      <IconTile icon={MapPin} tone={isActive ? "success" : "muted"} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {pole.name}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-0.5 text-badge-label",
              isActive
                ? "border-transparent bg-success-surface text-success-strong"
                : "border-transparent bg-warning-surface text-warning-strong"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                isActive ? "bg-success" : "bg-warning"
              )}
            />
            {pole.status}
          </Badge>
        </div>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Megaphone aria-hidden="true" className="size-3.5" />
          {pole.listings} anúncios
        </p>
      </div>
    </article>
  )
}
