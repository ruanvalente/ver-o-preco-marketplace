import Link from "next/link"
import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import type {
  ProductDetail,
  ProductSummary,
} from "../../types/product.types"
import { CONDITION_LABELS } from "../../utils/catalog-options"
import { formatPrice } from "../../utils/format"
import { ContactSellerCta } from "./contact-seller-cta"
import { ProductGallery } from "./product-gallery"
import { RelatedProducts } from "./related-products"
import { SellerCard } from "./seller-card"

type ProductDetailViewProps = {
  product: ProductDetail
  relatedProducts: ProductSummary[]
  isAuthenticated: boolean
}

/**
 * Composição visual do detalhe do anúncio.
 *
 * Recebe o modelo canônico já mapeado e não conhece o Supabase. A ação de
 * contato é composta separadamente porque depende da sessão do usuário.
 */
export function ProductDetailView({
  product,
  relatedProducts,
  isAuthenticated,
}: ProductDetailViewProps) {
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
        <ProductGallery images={product.images} title={product.title} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-transparent bg-card px-2.5 py-1 text-badge-label text-foreground shadow-card"
            >
              {CONDITION_LABELS[product.condition]}
            </Badge>

            <Badge
              asChild
              variant="outline"
              className="border-transparent bg-primary-muted px-2.5 py-1 text-badge-label text-primary"
            >
              <Link
                href={`/products?category=${encodeURIComponent(product.category.slug)}`}
              >
                {product.category.name}
              </Link>
            </Badge>
          </div>

          <h1 className="mt-4 text-balance text-headline-lg-mobile font-bold tracking-tight text-foreground sm:text-headline-lg">
            {product.title}
          </h1>

          <p className="mt-4 text-price-display text-primary">
            {formatPrice(product.price)}
          </p>

          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{product.location.label}</span>
            </span>
            <span aria-hidden="true" className="text-border">
              •
            </span>
            <span>{product.publishedLabel}</span>
          </p>

          <section aria-labelledby="description-title" className="mt-8">
            <h2
              id="description-title"
              className="text-headline-sm text-foreground"
            >
              Descrição
            </h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {product.description ||
                "O vendedor não adicionou uma descrição a este anúncio."}
            </p>
          </section>

          <div className="mt-8">
            <SellerCard seller={product.seller} />
          </div>

          <div className="mt-6">
            <ContactSellerCta
              productId={product.id}
              productTitle={product.title}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      <RelatedProducts
        products={relatedProducts}
        categoryName={product.category.name}
        categorySlug={product.category.slug}
      />
    </>
  )
}
