import Link from "next/link"
import { connection } from "next/server"

import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { getCurrentUser } from "@/features/auth/services/session.service"

/**
 * Área de autenticação do header.
 *
 * Server Component: o estado da sessão é lido no servidor e nunca inferido
 * apenas no cliente.
 */
export async function HeaderAuth() {
  await connection()
  const user = await getCurrentUser()

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Entrar
        </Link>
        <Button asChild size="sm" className="h-10">
          <Link href="/register">Criar conta</Link>
        </Button>
      </>
    )
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="h-10">
        <Link href="/dashboard">Minha conta</Link>
      </Button>
      <LogoutButton />
    </>
  )
}
