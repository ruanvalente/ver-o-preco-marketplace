import Link from "next/link";
import { connection } from "next/server";
import { Heart, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser } from "@/features/auth/services/session.service";
import { getChatConversations } from "@/features/chat/services/chat.service";
import { getFavoriteCount } from "@/features/favorites/services/favorites.service";
import { getProfile } from "@/features/profile/services/profile.service";
import { LogoutButton } from "@/features/auth/components/logout-button";

import { ChatHeaderNotifications } from "./chat-header-notifications";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "VP";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

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
 * Área de conta do header.
 *
 * Server Component: o estado da sessão e o nome exibido vêm do servidor. O
 * fallback de Suspense no header cobre a leitura dinâmica da sessão.
 */
export async function MarketplaceAccountArea() {
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm" className="h-11 px-3">
        <Link href="/login">
          <UserRound aria-hidden="true" className="size-4" />
          Entrar
        </Link>
      </Button>
    );
  }

  const [profile, favoriteResult] = await Promise.all([
    getProfile(user.id),
    getFavoriteCount(user.id),
  ]);
  const favoriteCount = favoriteResult.ok ? favoriteResult.data : null;
  const displayName =
    profile?.displayName?.trim() || user.email?.split("@")[0] || "Minha conta";
  const unreadConversations = await getUnreadChatConversationCount();

  return (
    <>
      <ChatHeaderNotifications
        initialCount={unreadConversations}
        className="relative hidden size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:inline-flex"
      />
      <Link
        href="/favorites"
        aria-label={
          favoriteCount === null
            ? "Meus favoritos, contagem indisponível"
            : `Meus favoritos, ${favoriteCount} ${favoriteCount === 1 ? "anúncio" : "anúncios"}`
        }
        className="relative hidden size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:inline-flex"
      >
        <Heart aria-hidden="true" className="size-5" />
        {favoriteCount !== null && favoriteCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
          >
            {favoriteCount > 9 ? "9+" : favoriteCount}
          </span>
        ) : null}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label={`Menu da conta de ${displayName}`}
            className="h-11 gap-2 rounded-full px-1.5 pr-2"
          >
            <Avatar size="default" className="size-9 sm:size-10">
              <AvatarImage
                src={profile?.avatarUrl || undefined}
                alt=""
              />
              <AvatarFallback className="bg-primary-muted text-xs font-semibold text-primary">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium text-foreground xl:inline">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>
            <span className="block truncate text-sm font-semibold text-foreground">
              {displayName}
            </span>
            <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
              {user.email ?? "E-mail não informado"}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserRound aria-hidden="true" className="size-4" />
              Meu perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <UserRound aria-hidden="true" className="size-4" />
              Meu painel
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="p-1">
            <LogoutButton className="h-11 w-full justify-start" />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}