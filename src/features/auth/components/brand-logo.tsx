import { Store } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  showAuthBadge?: boolean
  className?: string
}

/**
 * Marca textual do Ver-o-Preço.
 *
 * O símbolo é construído com um ícone Lucide para que possa ser substituído
 * pelo logo oficial sem alterar os pontos de uso.
 */
export function BrandLogo({ showAuthBadge = false, className }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-card">
        <Store aria-hidden="true" className="size-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-primary">
        Ver-o-Preço
      </span>
      {showAuthBadge ? (
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary-muted px-2 py-0.5 text-badge-label uppercase text-primary"
        >
          Auth
        </Badge>
      ) : null}
    </span>
  )
}
