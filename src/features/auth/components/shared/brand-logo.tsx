import { Store } from "lucide-react"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  showName?: boolean
}

export function BrandLogo({ className, showName = true }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-card">
        <Store aria-hidden="true" className="size-5" />
      </span>
      {showName ? (
        <span className="text-lg font-bold tracking-tight text-primary">
          Ver-o-Preço
        </span>
      ) : null}
    </div>
  )
}
