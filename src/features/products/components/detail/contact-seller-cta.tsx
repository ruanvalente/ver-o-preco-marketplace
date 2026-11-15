import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/features/favorites/components/favorite-button"
import { buildLoginPath } from "@/features/auth/utils/auth-routes"
import { StartConversationButton } from "@/features/chat/components/start-conversation-button"

type ContactSellerCtaProps = {
  productId: string
  productTitle: string
  isAuthenticated: boolean
  sellerId?: string
  currentUserId?: string | null
  isFavorite?: boolean
}

/**
 * Ação de contato do anúncio.
 *
 * Usuários anônimos são levados ao login preservando o retorno ao anúncio.
 * Usuários autenticados encontram o espaço do chat, que pertence à fase de
 * mensagens do MVP.
 */
export function ContactSellerCta({
  productId,
  productTitle,
  isAuthenticated,
  sellerId,
  currentUserId,
  isFavorite = false,
}: ContactSellerCtaProps) {
  return (
    <div className="space-y-3">
      {isAuthenticated &&
      sellerId &&
      currentUserId &&
      sellerId === currentUserId ? (
        <>
          <Button asChild variant="outline" size="lg" className="w-full gap-2">
            <Link href="/messages">
              <MessageCircle aria-hidden="true" className="size-4" />
              Ver minhas conversas
            </Link>
          </Button>
          <p className="text-pretty text-center text-label-sm text-muted-foreground">
            Este anúncio é seu.
          </p>
        </>
      ) : isAuthenticated ? (
        <>
          <StartConversationButton productId={productId} />
          <p className="text-pretty text-center text-label-sm text-muted-foreground">
            Converse com o vendedor sem compartilhar seus dados pessoais.
          </p>
        </>
      ) : (
        <>
          <Button asChild size="lg" className="w-full gap-2">
            <Link href={buildLoginPath(`/products/${productId}`)}>
              <MessageCircle aria-hidden="true" className="size-4" />
              Entrar para conversar
            </Link>
          </Button>
          <p className="text-pretty text-center text-label-sm text-muted-foreground">
            Entre na sua conta para conversar com este vendedor.
          </p>
        </>
      )}

      <div className="flex justify-center">
        <FavoriteButton
          productId={productId}
          productTitle={productTitle}
          isFavorite={isFavorite}
          redirectTo={`/products/${productId}`}
          className="border-border bg-card hover:bg-accent"
        />
      </div>
    </div>
  )
}
