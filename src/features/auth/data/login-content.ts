import {
  MapPin,
  MessageCircle,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export type MarketplaceHighlight = {
  icon: LucideIcon
  title: string
  description: string
}

/**
 * Conteúdo institucional do card de marketing da tela de login.
 * Mantido fora dos componentes para facilitar revisão de copy.
 */
export const MARKETPLACE_HIGHLIGHTS: readonly MarketplaceHighlight[] = [
  {
    icon: MessageCircle,
    title: "Negociação direta e transparente",
    description:
      "Converse no chat seguro em tempo real, sem intermediários que complicam sua venda.",
  },
  {
    icon: MapPin,
    title: "Pontos de entrega recomendados",
    description:
      "Pontos de encontro monitorados em shoppings, polos e praças de Belém e cidades metropolitanas.",
  },
  {
    icon: Wallet,
    title: "Taxa zero de comissão",
    description:
      "100% do lucro da sua negociação fica no seu bolso, fomentando a renda local.",
  },
]

export type CommunityAvatar = {
  initials: string
  label: string
}

export const COMMUNITY_AVATARS: readonly CommunityAvatar[] = [
  { initials: "BL", label: "Belém" },
  { initials: "AN", label: "Ananindeua" },
  { initials: "CS", label: "Castanhal" },
]

export const MARKETPLACE_CITIES = [
  "Belém",
  "Ananindeua",
  "Castanhal",
  "Santarém",
  "Marabá",
] as const

export type FooterLink = {
  label: string
  href: string
}

export const AUTH_FOOTER_LINKS: readonly FooterLink[] = [
  { label: "Privacidade", href: "/privacy" },
  { label: "Termos de Serviço", href: "/terms" },
  { label: "Suporte Regional", href: "/suporte" },
]
