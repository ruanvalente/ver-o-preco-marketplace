import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LandingBadge, LandingIconTone } from "../../types/landing.types"

import { IconTile } from "./icon-tile"

const badgeToneClasses: Record<NonNullable<LandingBadge["tone"]>, string> = {
  success: "border-transparent bg-success-surface text-success-strong",
  warning: "border-transparent bg-warning-surface text-warning-strong",
  muted: "border-transparent bg-muted text-muted-foreground",
}

type FeatureCardProps = {
  title: string
  description: string
  icon: LucideIcon
  tone?: LandingIconTone
  badge?: LandingBadge
  link?: {
    label: string
    href: string
  }
  className?: string
  children?: ReactNode
}

export function FeatureCard({
  title,
  description,
  icon,
  tone = "primary",
  badge,
  link,
  className,
  children,
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <IconTile icon={icon} tone={tone} />
        {badge ? (
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-0.5 text-badge-label",
              badgeToneClasses[badge.tone ?? "muted"]
            )}
          >
            {badge.label}
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {link ? (
        <Link
          href={link.href}
          className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {link.label}
          <span className="sr-only"> sobre {title}</span>
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : null}

      {children}
    </article>
  )
}
