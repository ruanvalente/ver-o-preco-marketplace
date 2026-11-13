import type { Metadata } from "next"

import { LegalPlaceholderPage } from "@/features/legal/components/legal-placeholder-page"

export const metadata: Metadata = {
  title: "Termos de Uso — Ver-o-Preço",
  description:
    "Regras de uso do Ver-o-Preço Marketplace para compradores e vendedores.",
}

export default function TermsPage() {
  return (
    <LegalPlaceholderPage
      title="Termos de Uso"
      description="As regras que valem para quem anuncia e para quem compra no Ver-o-Preço."
    />
  )
}
