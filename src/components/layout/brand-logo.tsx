import { Store } from "lucide-react"

import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  showName?: boolean
}

/**
 * Marca do Ver-o-Preço usada nas páginas públicas.
 *
 * O símbolo é construído com um ícone Lucide para que possa ser substituído
 * pelo logo oficial sem alterar os pontos de uso.
 */
export function BrandLogo({ className, showName = true }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card"
      >
        <Store className="size-5" />
      </span>
      {showName ? (
        <span className="text-lg font-bold tracking-tight text-primary">
          Ver-o-Preço
        </span>
      ) : null}
    </span>
  )
}
