import type { ReactNode } from "react"

import { AuthFooter } from "@/features/auth/components/auth-footer"
import { AuthHeader } from "@/features/auth/components/auth-header"

/**
 * Chrome exclusivo dos fluxos de entrada (login, cadastro e recuperação).
 * Não inclui o header do marketplace para evitar duplicidade de navegação.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AuthHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <AuthFooter />
    </div>
  )
}
