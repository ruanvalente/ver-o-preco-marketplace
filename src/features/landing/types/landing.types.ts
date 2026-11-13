import type { LucideIcon } from "lucide-react"

export type LandingLink = {
  label: string
  href: string
}

export type LandingIconTone =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "muted"

export type LandingBadge = {
  label: string
  tone?: "success" | "warning" | "muted"
}

export type LandingFeature = {
  title: string
  description: string
  icon: LucideIcon
  tone?: LandingIconTone
  badge?: LandingBadge
  link?: LandingLink
}

export type LandingStep = {
  title: string
  description: string
  icon: LucideIcon
}

export type LandingPoleStatus = "Ativo" | "Em expansão"

export type LandingPole = {
  name: string
  status: LandingPoleStatus
  listings: number
}

export type LandingFooterColumn = {
  title: string
  links: LandingLink[]
}
