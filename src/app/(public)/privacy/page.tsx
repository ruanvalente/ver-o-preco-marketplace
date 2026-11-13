import type { Metadata } from "next"

import { LegalPlaceholderPage } from "@/features/legal/components/legal-placeholder-page"

export const metadata: Metadata = {
  title: "Política de Privacidade — Ver-o-Preço",
  description:
    "Como o Ver-o-Preço trata os dados de quem compra e vende no marketplace regional do Pará.",
}

export default function PrivacyPage() {
  return (
    <LegalPlaceholderPage
      title="Política de Privacidade"
      description="Como o Ver-o-Preço coleta, usa e protege os dados de quem compra e vende no marketplace."
    />
  )
}
