import type { LucideIcon } from "lucide-react"

/**
 * Tipos de apresentação do domínio de descoberta de produtos.
 *
 * A home do marketplace é intencionalmente desacoplada da origem dos dados:
 * os componentes recebem estes tipos de domínio e não conhecem o formato
 * retornado pelo Supabase. O modelo canônico de leitura vive em
 * `product.types.ts`.
 */

export type CategoryTone =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "featured"

export type Category = {
  id: string
  name: string
  icon: LucideIcon
  count: number
  tone: CategoryTone
  href: string
}

export type MarketplacePolo = {
  value: string
  label: string
}

export type PopularSearch = {
  label: string
  query: string
}

export type TrustItem = {
  title: string
  description: string
  icon: LucideIcon
  tone: CategoryTone
}

export type SellStep = {
  title: string
  description: string
}

export type FooterLink = {
  label: string
  href: string
}

export type FooterColumn = {
  title: string
  links: FooterLink[]
}
