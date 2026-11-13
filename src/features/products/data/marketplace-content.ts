import { Handshake, MessageSquareLock, ShieldCheck } from "lucide-react";

import type {
  FooterColumn,
  MarketplacePolo,
  PopularSearch,
  SellStep,
  TrustItem,
} from "../types/marketplace.types";

/**
 * Conteúdo estático de apresentação da home do marketplace.
 *
 * Categorias e anúncios vêm da camada de serviços de produtos. Este arquivo
 * mantém apenas conteúdo editorial e navegação.
 */

export const marketplacePolos: MarketplacePolo[] = [
  { value: "belem", label: "Belém e Região Metropolitana" },
  { value: "castanhal", label: "Castanhal e Nordeste do Pará" },
  { value: "santarem", label: "Santarém e Oeste do Pará" },
  { value: "maraba", label: "Marabá e Sudeste do Pará" },
  { value: "salinas", label: "Salinópolis e Costa Atlântica" },
];

export const popularSearches: PopularSearch[] = [
  { label: "iPhone 15", query: "iphone 15" },
  { label: "PlayStation 5", query: "playstation 5" },
  { label: "Mesa de escritório", query: "mesa de escritório" },
  { label: "Bicicleta aro 29", query: "bicicleta aro 29" },
  { label: "Geladeira Frost Free", query: "geladeira frost free" },
];

export const sellSteps: SellStep[] = [
  {
    title: "Fotografe seu item",
    description: "Use fotos claras e mostre os detalhes que importam.",
  },
  {
    title: "Publique em 2 minutos",
    description: "Informe preço, estado e localização. Sem burocracia.",
  },
  {
    title: "Negocie pelo chat",
    description: "Converse com quem está perto e combine a entrega.",
  },
];

export const trustItems: TrustItem[] = [
  {
    title: "Negociação direta, sem taxas abusivas",
    description:
      "Você negocia direto com o comprador e recebe o valor combinado. Sem comissão sobre a venda.",
    icon: Handshake,
    tone: "primary",
  },
  {
    title: "Comunidade verificada",
    description:
      "Perfis com informações reais e histórico de uso para você saber com quem está negociando.",
    icon: ShieldCheck,
    tone: "success",
  },
  {
    title: "Chat seguro em tempo real",
    description:
      "Converse sobre o anúncio dentro da plataforma, com histórico e sem expor seu telefone.",
    icon: MessageSquareLock,
    tone: "secondary",
  },
];

export const marketplaceFooterColumns: FooterColumn[] = [
  {
    title: "Sobre a Ver-o-Preço",
    links: [
      { label: "Início", href: "/" },
      { label: "Sobre o Ver-o-Preço", href: "/about" },
      { label: "Como funciona", href: "/about#como-funciona" },
      { label: "Segurança", href: "/about#seguranca" },
    ],
  },
  {
    title: "Para compradores",
    links: [
      { label: "Explorar produtos", href: "/" },
      { label: "Categorias", href: "/#categorias" },
      { label: "Como comprar", href: "/about#como-funciona" },
      { label: "Chat seguro", href: "/about#seguranca" },
    ],
  },
  {
    title: "Para vendedores",
    links: [
      { label: "Anunciar produto", href: "/register" },
      { label: "Criar conta", href: "/register" },
      { label: "Entrar", href: "/login" },
      { label: "Minha conta", href: "/dashboard" },
    ],
  },
];

export const marketplaceFooterLegalLinks = [
  { label: "Privacidade", href: "/privacy" },
  { label: "Termos de uso", href: "/terms" },
  { label: "Política de cookies", href: "/cookies" },
] as const;
