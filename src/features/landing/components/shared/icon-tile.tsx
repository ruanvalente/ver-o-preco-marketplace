import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { LandingIconTone } from "../../types/landing.types"

const toneClasses: Record<LandingIconTone, string> = {
  primary: "bg-primary-muted text-primary",
  secondary: "bg-secondary-muted text-secondary-strong",
  success: "bg-success-surface text-success-strong",
  danger: "bg-danger-surface text-danger",
  muted: "bg-muted text-foreground",
}

type IconTileProps = {
  icon: LucideIcon
  tone?: LandingIconTone
  className?: string
}

export function IconTile({ icon: Icon, tone = "primary", className }: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl",
        toneClasses[tone],
        className
      )}
    >
      <Icon className="size-5" />
    </span>
  )
}
