import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/features/favorites/components/favorite-button"
import { buildLoginPath } from "@/features/auth/utils/auth-routes"

type ContactSellerCtaProps = {
  productId: string
  productTitle: string
  isAuthenticated: boolean
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
}: ContactSellerCtaProps) {
  return (
    <div className="space-y-3">
      {isAuthenticated ? (
        <>
          <Button type="button" size="lg" disabled className="w-full gap-2">
            <MessageCircle aria-hidden="true" className="size-4" />
            Conversar com o vendedor
          </Button>
          <p className="text-pretty text-center text-label-sm text-muted-foreground">
            O chat entre compradores e vendedores está em desenvolvimento.
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
          className="border-border bg-card hover:bg-accent"
        />
      </div>
    </div>
  )
}
