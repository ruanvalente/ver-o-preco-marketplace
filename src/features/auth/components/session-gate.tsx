import type { ReactNode } from "react"

import { redirectIfAuthenticated } from "../services/session.service"

type RedirectIfAuthenticatedProps = {
  children: ReactNode
}

/**
 * Server Component que impede que um usuário autenticado veja os fluxos de
 * entrada novamente.
 *
 * Deve ser renderizado dentro de um limite de `<Suspense>`, pois lê a sessão.
 */
export async function RedirectIfAuthenticated({
  children,
}: RedirectIfAuthenticatedProps) {
  await redirectIfAuthenticated()

  return <>{children}</>
}
