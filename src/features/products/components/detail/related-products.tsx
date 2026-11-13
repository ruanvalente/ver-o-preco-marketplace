import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { ProductSummary } from "../../types/product.types"
import { ProductGrid } from "../product-grid"

type RelatedProductsProps = {
  products: ProductSummary[]
  categoryName: string
  categorySlug: string
}

/**
 * Vitrine de anúncios da mesma categoria exibida ao final do detalhe.
 *
 * Retorna `null` quando não há anúncios relacionados para não criar uma seção
 * vazia na página.
 */
export function RelatedProducts({
  products,
  categoryName,
  categorySlug,
}: RelatedProductsProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="related-title" className="mt-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2
            id="related-title"
            className="text-headline-lg-mobile font-bold tracking-tight text-foreground sm:text-headline-lg"
          >
            Anúncios relacionados
          </h2>
          <p className="text-sm text-muted-foreground">
            Mais opções em {categoryName} perto de você.
          </p>
        </div>

        <Link
          href={`/products?category=${encodeURIComponent(categorySlug)}`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Ver tudo em {categoryName}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <ProductGrid products={products} className="mt-6" />
    </section>
  )
}
