import Link from "next/link"
import { connection } from "next/server"
import { Heart, UserRound } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"
import { getCurrentUser } from "@/features/auth/services/session.service"
import { cn } from "@/lib/utils"

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
    return (
      <>
        <SheetClose asChild>
          <Link
            href="/favorites"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 w-full rounded-full",
            )}
          >
            <Heart aria-hidden="true" className="size-4" />
            Meus favoritos
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "h-11 w-full rounded-full",
            )}
          >
            <UserRound aria-hidden="true" className="size-4" />
            Minha conta
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
