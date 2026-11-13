import type { ReactNode } from "react"

import { LoginCard } from "./login-card"
import { MarketplaceInfoCard } from "./marketplace-info-card"

type LoginPageProps = {
  /** Conteúdo do formulário, mantendo a rota responsável pela sessão. */
  form: ReactNode
}

/**
 * Composição visual da rota `/login`.
 *
 * Mobile-first: os cards ficam empilhados (login primeiro) e passam a ocupar
 * duas colunas a partir de `lg`.
 */
export function LoginPage({ form }: LoginPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="grid w-full gap-6 lg:grid-cols-2 lg:items-stretch">
        <LoginCard form={form} />
        <MarketplaceInfoCard />
      </div>
    </main>
  )
}
