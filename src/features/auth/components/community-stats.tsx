import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import {
  COMMUNITY_AVATARS,
  MARKETPLACE_CITIES,
} from "../data/login-content"

const AVATAR_STYLES = [
  "bg-primary-muted text-primary",
  "bg-secondary-muted text-secondary-strong",
  "bg-accent text-foreground",
] as const

export function CommunityStats() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2" aria-hidden="true">
          {COMMUNITY_AVATARS.map((avatar, index) => (
            <span
              key={avatar.label}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-badge-label font-semibold ring-2 ring-card",
                AVATAR_STYLES[index % AVATAR_STYLES.length]
              )}
            >
              {avatar.initials}
            </span>
          ))}
        </div>

        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            +15.000
          </p>
          <p className="text-xs text-muted-foreground">
            Usuários ativos na rede
          </p>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {MARKETPLACE_CITIES.map((city) => (
          <li key={city}>
            <Badge
              variant="outline"
              className="border-border/70 bg-surface-container-low px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {city}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}
