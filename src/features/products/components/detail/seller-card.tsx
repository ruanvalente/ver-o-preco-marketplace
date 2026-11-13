import Link from "next/link"
import { MapPin, Store } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import type { ProductSeller } from "../../types/product.types"

type SellerCardProps = {
  seller: ProductSeller
}

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
 * Informações públicas do vendedor.
 *
 * Não expõe e-mail, telefone ou identificadores internos além do necessário
 * para abrir o perfil público. O contato acontece pelo chat.
 */
export function SellerCard({ seller }: SellerCardProps) {
  const profileHref = seller.id ? `/profile/${seller.id}` : null

  return (
    <section
      aria-labelledby="seller-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <h2 id="seller-title" className="sr-only">
        Informações do vendedor
      </h2>

      <div className="flex items-center gap-3">
        <Avatar size="lg" className="size-12">
          {seller.avatarUrl ? (
            <AvatarImage src={seller.avatarUrl} alt={seller.displayName} />
          ) : null}
          <AvatarFallback aria-hidden="true" className="text-sm font-semibold">
            {getInitials(seller.displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <Badge
            variant="outline"
            className="gap-1 border-transparent bg-primary-muted text-primary"
          >
            <Store aria-hidden="true" className="size-3" />
            Vendedor
          </Badge>

          <p className="mt-1 truncate text-sm font-semibold text-foreground">
            {profileHref ? (
              <Link
                href={profileHref}
                className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {seller.displayName}
              </Link>
            ) : (
              seller.displayName
            )}
          </p>

          {seller.location ? (
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-label-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{seller.location}</span>
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
        Negocie pelo chat do Ver-o-Preço. Combine detalhes, pagamento e entrega
        diretamente com quem está anunciando.
      </p>
    </section>
  )
}
