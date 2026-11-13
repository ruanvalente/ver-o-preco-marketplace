import type { Metadata } from "next"
import { Suspense } from "react"

import { ProductsCatalog } from "@/features/products/components/catalog/products-catalog"
import { ProductsCatalogSkeleton } from "@/features/products/components/catalog/products-catalog-skeleton"

export const metadata: Metadata = {
  title: "Explorar produtos — Ver-o-Preço",
  description:
    "Catálogo de produtos do Ver-o-Preço Marketplace no Pará. Busque por categoria, condição, preço e município para comprar e vender perto de você.",
}

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Catálogo público de produtos.
 *
 * O cabeçalho é estático e entra no shell da página. Os resultados dependem de
 * `searchParams` e são transmitidos dentro de um limite de Suspense próprio.
 */
export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <header className="max-w-3xl">
        <h1 className="text-balance text-headline-lg-mobile font-bold tracking-tight text-foreground sm:text-headline-lg">
          Explorar produtos
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Encontre o que você precisa perto de casa. Filtre por categoria,
          condição, preço e região para ver anúncios de todo o Pará.
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<ProductsCatalogSkeleton />}>
          <ProductsCatalog searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}
