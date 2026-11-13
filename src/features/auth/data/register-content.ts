import {
  MessageCircle,
  MapPin,
  ShieldCheck,
  Store,
  type LucideIcon,
} from "lucide-react"

export type RegistrationStat = {
  value: string
  label: string
}

export type RegistrationBenefit = {
  icon: LucideIcon
  title: string
  description: string
}

/**
 * Conteúdo institucional da tela de cadastro.
 * Mantido fora dos componentes para facilitar revisão de copy e de produto.
 */
export const REGISTRATION_STATS: readonly RegistrationStat[] = [
  { value: "+15 mil", label: "pessoas na rede" },
  { value: "144", label: "municípios do Pará" },
  { value: "0%", label: "de comissão" },
]

export const REGISTRATION_BENEFITS: readonly RegistrationBenefit[] = [
  {
    icon: MessageCircle,
    title: "Converse sem sair do Ver-o-Preço",
    description:
      "Negocie pelo chat, tire dúvidas e combine os detalhes com mais segurança.",
  },
  {
    icon: Store,
    title: "Anuncie de graça",
    description:
      "Publique o que você quer vender sem pagar comissão sobre a negociação.",
  },
  {
    icon: MapPin,
    title: "Encontre gente perto",
    description:
      "Descubra produtos em Belém, Ananindeua, Santarém e em todo o Pará.",
  },
]

export const REGISTRATION_PRIVACY = {
  icon: ShieldCheck,
  title: "Seus dados, protegidos",
  description:
    "Usamos suas informações para criar e manter sua conta segura. Você escolhe o que quer receber e pode alterar suas preferências quando quiser.",
  linkLabel: "Entenda como cuidamos dos seus dados",
  linkHref: "/privacy",
} as const
