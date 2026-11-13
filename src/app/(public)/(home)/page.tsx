import type { Metadata } from "next"

import { MarketplaceHome } from "@/features/products/components/home/marketplace-home"

export const metadata: Metadata = {
  title: "Ver-o-Preço — Compre e venda perto de você no Pará",
  description:
    "Encontre produtos perto de você no Pará e venda o que não usa. Anúncios de gente da sua região, negociação direta e chat seguro no Ver-o-Preço.",
  openGraph: {
    title: "Ver-o-Preço — Compre e venda perto de você no Pará",
    description:
      "Marketplace regional do Pará com anúncios perto de você, negociação direta e chat seguro.",
    locale: "pt_BR",
    siteName: "Ver-o-Preço",
    type: "website",
  },
}

export default function Home() {
  return <MarketplaceHome />
}
