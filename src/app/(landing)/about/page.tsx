import type { Metadata } from "next"

import { LandingPage } from "@/features/landing/components/landing-page"

export const metadata: Metadata = {
  title: "Sobre o Ver-o-Preço — Marketplace regional do Pará",
  description:
    "Conheça o Ver-o-Preço, o marketplace regional do Pará para comprar e vender sem taxas e sem burocracia.",
  openGraph: {
    title: "Sobre o Ver-o-Preço — Marketplace regional do Pará",
    description:
      "Marketplace regional do Pará com taxa zero, chat seguro e comércio de vizinhança.",
    locale: "pt_BR",
    siteName: "Ver-o-Preço",
    type: "website",
  },
}

export default function SobrePage() {
  return <LandingPage />
}
