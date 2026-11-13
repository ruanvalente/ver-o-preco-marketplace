import {
  BadgeCheck,
  Bell,
  Camera,
  Clock,
  Filter,
  Handshake,
  LayoutDashboard,
  MapPinCheck,
  MessageSquareLock,
  MessageSquareWarning,
  PiggyBank,
  ReceiptText,
  ScanSearch,
  ShieldCheck,
  ShieldUser,
  Store,
  UserPlus,
} from "lucide-react";

import type {
  LandingFeature,
  LandingFooterColumn,
  LandingLink,
  LandingPole,
  LandingStep,
} from "../types/landing.types";

export const landingNavItems: LandingLink[] = [
  { label: "Início", href: "#inicio" },
  { label: "Experiência", href: "#experiencia" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Segurança", href: "#seguranca" },
  { label: "Suporte", href: "#suporte" },
];

export const heroTrustItems = [
  "Taxa zero",
  "100% seguro",
  "Suporte regional",
] as const;

export const finalCtaTrustItems = [
  "Cadastro grátis",
  "Sem taxa",
  "Suporte regional",
] as const;

export const painPoints: LandingFeature[] = [
  {
    title: "Taxas abusivas de intermediação",
    description:
      "Comissões altas e custos escondidos consomem o lucro de quem vende e encarecem quem compra.",
    icon: ReceiptText,
    tone: "danger",
    link: { label: "Veja como resolvemos", href: "#solucao" },
  },
  {
    title: "Grupos e insegurança no WhatsApp",
    description:
      "Negociações espalhadas em dezenas de grupos, sem histórico, sem contexto e sem proteção para os dois lados.",
    icon: MessageSquareWarning,
    tone: "danger",
    link: { label: "Veja como resolvemos", href: "#solucao" },
  },
  {
    title: "Filtros ineficientes para o Pará",
    description:
      "Marketplaces distantes ignoram bairros, municípios e a realidade de quem compra e vende aqui.",
    icon: Filter,
    tone: "danger",
    link: { label: "Veja como resolvemos", href: "#solucao" },
  },
];

export const valuePropositions: LandingFeature[] = [
  {
    title: "Lucro 100% seu",
    description:
      "Anuncie de graça e receba o valor combinado direto do comprador. Sem comissão sobre a venda.",
    icon: PiggyBank,
    tone: "success",
    badge: { label: "Taxa zero", tone: "success" },
  },
  {
    title: "Privacidade preservada",
    description:
      "Seu telefone e e-mail não ficam expostos. A conversa acontece no chat da plataforma, no seu tempo.",
    icon: ShieldCheck,
    tone: "primary",
    badge: { label: "Você no controle", tone: "muted" },
  },
  {
    title: "Comércio de vizinhança",
    description:
      "Anúncios organizados por município para encontrar o que você precisa sem atravessar a cidade.",
    icon: Store,
    tone: "muted",
    badge: { label: "Perto de você", tone: "muted" },
  },
];

export const technologyFeatures: LandingFeature[] = [
  {
    title: "Catálogo inteligente",
    description:
      "Busca e filtros por categoria, preço, condição e região para achar o que importa perto de você.",
    icon: ScanSearch,
    tone: "primary",
    badge: { label: "Disponível", tone: "success" },
  },
  {
    title: "Chat integrado",
    description:
      "Converse sobre o anúncio sem sair da plataforma, com o histórico da negociação sempre à mão.",
    icon: MessageSquareLock,
    tone: "success",
    badge: { label: "Disponível", tone: "success" },
  },
  {
    title: "Publicação em 2 minutos",
    description:
      "Fotos, descrição e preço. Um fluxo curto para colocar seu produto no ar sem burocracia.",
    icon: Clock,
    tone: "secondary",
    badge: { label: "Disponível", tone: "success" },
  },
  {
    title: "Dashboard do vendedor",
    description:
      "Acompanhe anúncios, mensagens e o desempenho das suas vendas em um só lugar.",
    icon: LayoutDashboard,
    tone: "muted",
    badge: { label: "Em breve", tone: "muted" },
  },
  {
    title: "Selos e reputação",
    description:
      "Sinais de confiança construídos a partir do histórico e da presença de cada perfil.",
    icon: BadgeCheck,
    tone: "primary",
    badge: { label: "Em breve", tone: "muted" },
  },
  {
    title: "Notificações em tempo real",
    description:
      "Receba um aviso quando alguém demonstrar interesse ou responder à sua mensagem.",
    icon: Bell,
    tone: "secondary",
    badge: { label: "Em breve", tone: "muted" },
  },
];

export const howItWorksSteps: LandingStep[] = [
  {
    title: "Crie sua conta em segundos",
    description:
      "Cadastro gratuito com e-mail. Você só precisa de alguns dados para começar.",
    icon: UserPlus,
  },
  {
    title: "Anuncie o que não usa",
    description:
      "Adicione fotos, descrição e preço. Seu anúncio fica visível para quem está por perto.",
    icon: Camera,
  },
  {
    title: "Negocie pelo Chat Seguro",
    description:
      "Tire dúvidas e combine os detalhes diretamente com o comprador ou vendedor.",
    icon: MessageSquareLock,
  },
  {
    title: "Combine a entrega presencial",
    description:
      "Escolha um ponto movimentado da sua região e finalize a negociação pessoalmente.",
    icon: Handshake,
  },
];

export const securityFeatures: LandingFeature[] = [
  {
    title: "Autenticação com Supabase",
    description:
      "Sua conta é protegida por um dos serviços de autenticação mais confiáveis do mercado, com sessões seguras e recuperação de acesso.",
    icon: ShieldUser,
    tone: "primary",
  },
  {
    title: "Polos de encontro sugeridos",
    description:
      "Prefira lugares movimentados e públicos, como shoppings, praças e pontos comerciais, para combinar a entrega.",
    icon: MapPinCheck,
    tone: "success",
  },
  {
    title: "Contato pela plataforma",
    description:
      "Mantenha a conversa no chat e acione os canais de denúncia se algo parecer fora do combinado. Sua segurança vem primeiro.",
    icon: MessageSquareWarning,
    tone: "muted",
  },
];

export const regionalPoles: LandingPole[] = [
  { name: "Belém", status: "Ativo", listings: 248 },
  { name: "Ananindeua", status: "Ativo", listings: 136 },
  { name: "Castanhal", status: "Ativo", listings: 84 },
  { name: "Marituba", status: "Em expansão", listings: 57 },
  { name: "Santarém", status: "Em expansão", listings: 42 },
  { name: "Marabá", status: "Em expansão", listings: 31 },
];

export const footerColumns: LandingFooterColumn[] = [
  {
    title: "Sobre a Ver-o-Preço",
    links: [
      { label: "Início", href: "#inicio" },
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Experiência", href: "#experiencia" },
      { label: "Segurança", href: "#seguranca" },
    ],
  },
  {
    title: "Para compradores",
    links: [
      { label: "Explorar produtos", href: "/" },
      { label: "Como comprar", href: "#como-funciona" },
      { label: "Chat seguro", href: "#seguranca" },
    ],
  },
  {
    title: "Para vendedores",
    links: [
      { label: "Anunciar produto", href: "/register" },
      { label: "Criar conta", href: "/register" },
      { label: "Entrar", href: "/login" },
      { label: "Como vender", href: "#como-funciona" },
    ],
  },
  {
    title: "Polos e suporte",
    links: [
      { label: "Belém", href: "#polos" },
      { label: "Ananindeua", href: "#polos" },
      { label: "Castanhal", href: "#polos" },
      { label: "Santarém", href: "#polos" },
      { label: "Central de ajuda", href: "#suporte" },
    ],
  },
];

export const footerLegalLinks: LandingLink[] = [
  { label: "Privacidade", href: "/privacy" },
  { label: "Termos de uso", href: "/terms" },
  { label: "Política de cookies", href: "/cookies" },
];
