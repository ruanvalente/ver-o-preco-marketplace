import type { Metadata } from "next"

import { LegalPlaceholderPage } from "@/features/legal/components/legal-placeholder-page"

export const metadata: Metadata = {
  title: "Política de Cookies — Ver-o-Preço",
  description:
    "Como o Ver-o-Preço utiliza cookies e tecnologias semelhantes.",
}

export default function CookiesPage() {
  return (
    <LegalPlaceholderPage
      title="Política de Cookies"
      description="Quais cookies o Ver-o-Preço utiliza, para que servem e como você pode controlá-los."
    />
  )
}
