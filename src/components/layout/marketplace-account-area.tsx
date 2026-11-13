import Link from "next/link"
import { connection } from "next/server"
import { UserRound } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/features/auth/services/session.service"
import { getProfile } from "@/features/profile/services/profile.service"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "VP"
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/**
 * Área de conta do header.
 *
 * Server Component: o estado da sessão e o nome exibido vêm do servidor. O
 * fallback de Suspense no header cobre a leitura dinâmica da sessão.
 */
export async function MarketplaceAccountArea() {
  await connection()
  const user = await getCurrentUser()

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm" className="h-11 px-3">
        <Link href="/login">
          <UserRound aria-hidden="true" className="size-4" />
          Entrar
        </Link>
      </Button>
    )
  }

  const profile = await getProfile(user.id)
  const displayName =
    profile?.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "Minha conta"

  return (
    <Link
      href="/dashboard"
      className="flex min-h-11 items-center gap-2 rounded-full pr-2 pl-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Avatar size="default" className="size-9">
        <AvatarFallback className="bg-primary-muted text-xs font-semibold text-primary">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <span className="hidden max-w-32 truncate text-sm font-medium text-foreground xl:inline">
        {displayName}
      </span>
    </Link>
  )
}
