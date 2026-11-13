import type { ReactNode } from "react"

import { RegistrationCard } from "./registration-card"
import { RegistrationInfoPanel } from "./registration-info-panel"

type CreateAccountPageProps = {
  /** Conteúdo do formulário, mantendo a rota responsável pela sessão. */
  form: ReactNode
}

/**
 * Composição visual da rota `/register`.
 *
 * Mobile-first: os cards ficam empilhados (cadastro primeiro) e passam a
 * ocupar duas colunas a partir de `lg`.
 */
export function CreateAccountPage({ form }: CreateAccountPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-start px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto grid w-full max-w-2xl gap-6 lg:max-w-none lg:grid-cols-2 lg:items-stretch">
        <RegistrationCard form={form} />
        <RegistrationInfoPanel />
      </div>
    </main>
  )
}
