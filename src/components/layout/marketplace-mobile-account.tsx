import Link from "next/link"
import { connection } from "next/server"
import { Heart, UserRound } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"
import { getCurrentUser } from "@/features/auth/services/session.service"
import { getChatConversations } from "@/features/chat/services/chat.service"
import { getFavoriteCount } from "@/features/favorites/services/favorites.service"
import { getProfile } from "@/features/profile/services/profile.service"
import { cn } from "@/lib/utils"

import { ChatHeaderNotifications } from "./chat-header-notifications"

async function getUnreadChatConversationCount(): Promise<number | null> {
  let unreadCount = 0
  let offset = 0

  while (true) {
    const result = await getChatConversations(100, offset)

    if (!result.ok) {
      return null
    }

    unreadCount += result.data.filter(
      (conversation) => conversation.unreadCount > 0,
    ).length

    if (result.data.length < 100) {
      return unreadCount
    }

    offset += result.data.length
  }
}

/**
 * Ação de conta do menu mobile.
 *
 * Server Component para refletir a sessão real, como a área de conta do header.
 * O menu recebe este bloco pronto e não precisa conhecer o estado de auth.
 */
export async function MarketplaceMobileAccount() {
  await connection()
  const user = await getCurrentUser()

  if (user) {
    const [unreadConversations, favoriteResult, profile] = await Promise.all([
      getUnreadChatConversationCount(),
      getFavoriteCount(user.id),
      getProfile(user.id),
    ])
    const favoriteCount = favoriteResult.ok ? favoriteResult.data : null
    const displayName =
      profile?.displayName?.trim() || user.email?.split("@")[0] || "Minha conta"

    return (
      <>
        <div className="border-t border-border pt-5">
          <p className="truncate px-3 text-sm font-semibold text-foreground">
            {displayName}
          </p>
          <p className="mt-1 truncate px-3 text-sm text-muted-foreground">
            {user.email ?? "E-mail não informado"}
          </p>
        </div>
        <SheetClose asChild>
          <ChatHeaderNotifications
            initialCount={unreadConversations}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "flex h-11 w-full items-center justify-center gap-2 rounded-full",
            )}
            ariaLabel="Mensagens"
          />
        </SheetClose>
        <SheetClose asChild>
          <Link
            href="/favorites"
            aria-label={
              favoriteCount === null
                ? "Meus favoritos, contagem indisponível"
                : `Meus favoritos, ${favoriteCount} ${favoriteCount === 1 ? "anúncio" : "anúncios"}`
            }
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "relative h-11 w-full rounded-full",
            )}
          >
            <Heart aria-hidden="true" className="size-4" />
            Meus favoritos
            {favoriteCount !== null ? (
              <span className="ml-1 rounded-full bg-primary-muted px-2 py-0.5 text-xs text-primary">
                {favoriteCount}
              </span>
            ) : null}
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link
            href="/profile"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "h-11 w-full rounded-full",
            )}
          >
            <UserRound aria-hidden="true" className="size-4" />
            Meu perfil
          </Link>
        </SheetClose>
      </>
    )
  }

  return (
    <SheetClose asChild>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost", size: "lg" }),
          "h-11 w-full rounded-full",
        )}
      >
        <UserRound aria-hidden="true" className="size-4" />
        Entrar na minha conta
      </Link>
    </SheetClose>
  )
}
