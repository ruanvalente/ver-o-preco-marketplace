import Link from "next/link"

import { Button } from "@/components/ui/button"

import {
  getProductCategories,
  getProducts,
} from "../../services/products.service"
import type { ProductFilters } from "../../types/product.types"
import { formatListingCount } from "../../utils/format"
import {
  buildProductsHref,
  getActiveFilterCount,
  hasActiveFilters,
  parseProductFilters,
  type RawSearchParams,
} from "../../utils/query"
import { ProductEmptyState } from "../product-empty-state"
import { ProductErrorState } from "../product-error-state"
import { ProductGrid } from "../product-grid"
import { MobileProductFilters } from "./mobile-product-filters"
import { ProductFiltersForm } from "./product-filters-form"
import { ProductPagination } from "./product-pagination"
import { ProductSortLinks } from "./product-sort-links"

type ProductsCatalogProps = {
  searchParams: Promise<RawSearchParams>
}

function ResultsSummary({
  filters,
  total,
}: {
  filters: ProductFilters
  total: number
}) {
  if (filters.q) {
    return (
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {formatListingCount(total)}
        </span>{" "}
        para <span className="font-medium text-foreground">“{filters.q}”</span>
      </p>
    )
  }

  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">
        {formatListingCount(total)}
      </span>{" "}
      {hasActiveFilters(filters) ? "com os filtros aplicados" : "disponíveis"}
    </p>
  )
}

/**
 * Resultados do catálogo público.
 *
 * A URL é a fonte de verdade da busca: filtros, ordenação e paginação vivem em
 * `searchParams`, o que mantém a página compartilhável e renderizada no
 * servidor. O componente é assíncrono e deve ser envolvido por `<Suspense>` na
 * rota, já que lê dados de runtime.
 */
export async function ProductsCatalog({ searchParams }: ProductsCatalogProps) {
  const filters = parseProductFilters(await searchParams)

  const [categoriesResult, productsResult] = await Promise.all([
    getProductCategories(),
    getProducts(filters),
  ])

  if (!categoriesResult.ok) {
    return <ProductErrorState message={categoriesResult.error} />
  }

  if (!productsResult.ok) {
    return <ProductErrorState message={productsResult.error} />
  }

  const categories = categoriesResult.data
  const page = productsResult.data
  const activeFilterCount = getActiveFilterCount(filters)
  const searchKey = buildProductsHref(filters)

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <aside
        aria-label="Filtros do catálogo"
        className="hidden lg:block"
      >
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-5 text-headline-sm text-foreground">Filtros</h2>
          <ProductFiltersForm filters={filters} categories={categories} />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ResultsSummary filters={filters} total={page.total} />

          <div className="flex min-w-0 items-center gap-2">
            <div className="lg:hidden">
              <MobileProductFilters
                key={searchKey}
                activeCount={activeFilterCount}
              >
                <ProductFiltersForm
                  filters={filters}
                  categories={categories}
                  idPrefix="mobile-filter"
                />
              </MobileProductFilters>
            </div>

            <ProductSortLinks filters={filters} />
          </div>
        </div>

        <div className="mt-6">
          {page.items.length > 0 ? (
            <ProductGrid products={page.items} />
          ) : page.total > 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <h2 className="text-headline-sm font-semibold text-foreground">
                Esta página não existe
              </h2>
              <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                Os anúncios que você procura estão em outra página.
              </p>
              <Button asChild className="mt-6">
                <Link href={buildProductsHref(filters, { page: 1 })}>
                  Voltar para a primeira página
                </Link>
              </Button>
            </div>
          ) : (
            <ProductEmptyState
              hasFilters={hasActiveFilters(filters)}
              resetHref="/products"
            />
          )}
        </div>

        <ProductPagination filters={filters} totalPages={page.totalPages} />
      </div>
    </div>
  )
}
