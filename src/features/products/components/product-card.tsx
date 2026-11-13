import Link from "next/link"
import { ImageOff, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { FavoriteButton } from "@/features/favorites/components/favorite-button"
import { cn } from "@/lib/utils"

import type { ProductSummary } from "../types/product.types"
import { CONDITION_LABELS } from "../utils/catalog-options"
import { formatPrice } from "../utils/format"
import { ProductImage } from "./product-image"

type ProductCardProps = {
  product: ProductSummary
  className?: string
}

/**
 * Card de produto do catálogo público.
 *
 * Recebe apenas o modelo de leitura canônico. Favoritar é composto via
 * `FavoriteButton`, mantendo a responsabilidade de persistência fora do card.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const productHref = `/products/${product.id}`
  const image = product.image

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow duration-200 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <ProductImage
            src={image.url}
            alt={image.alt}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div
            role="img"
            aria-label={`${product.title} sem imagem disponível`}
            className="flex size-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
          >
            <ImageOff aria-hidden="true" className="size-8" />
            <span className="text-label-sm">Sem imagem</span>
          </div>
        )}

        <Link
          href={productHref}
          aria-label={`Ver detalhes de ${product.title}`}
          className="absolute inset-0 z-[1] rounded-t-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/70"
        />

        <Badge
          variant="outline"
          className="absolute top-3 left-3 z-10 border-transparent bg-card/95 px-2.5 py-1 text-badge-label text-foreground shadow-card backdrop-blur-sm"
        >
          {CONDITION_LABELS[product.condition]}
        </Badge>

        <FavoriteButton
          productId={product.id}
          productTitle={product.title}
          className="absolute top-2 right-2 z-10"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-price-display text-primary">
          {formatPrice(product.price)}
        </p>

        <h3 className="line-clamp-2 text-headline-sm leading-snug font-semibold text-foreground">
          <Link
            href={productHref}
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {product.title}
          </Link>
        </h3>

        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-label-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{product.location.label}</span>
          <span aria-hidden="true" className="shrink-0 text-border">
            •
          </span>
          <span className="truncate">{product.seller.displayName}</span>
        </p>

        <p className="mt-auto pt-2 text-label-sm text-muted-foreground">
          {product.publishedLabel}
        </p>
      </div>
    </article>
  )
}
