import { Suspense } from "react"

import {
  getActiveProductCount,
  getProductCategories,
  getRecentProducts,
} from "../../services/products.service"
import { mapCategorySummaryToCategory } from "../../utils/catalog-options"
import { ProductErrorState } from "../product-error-state"
import { HeroSection } from "./hero-section"
import { PopularCategories } from "./popular-categories"
import { RecentListings } from "./recent-listings"
import { SellCtaBanner } from "./sell-cta-banner"
import { TrustSection } from "./trust-section"
import {
  CategoriesSectionSkeleton,
  RecentListingsSkeleton,
} from "./home-skeleton"

async function CategoriesSection() {
  const result = await getProductCategories()

  if (!result.ok) {
    return <ProductErrorState message={result.error} retryHref="/" />
  }

  return (
    <PopularCategories
      categories={result.data.map(mapCategorySummaryToCategory)}
    />
  )
}

async function RecentListingsSection() {
  const [productsResult, countResult] = await Promise.all([
    getRecentProducts(8),
    getActiveProductCount(),
  ])

  if (!productsResult.ok) {
    return <ProductErrorState message={productsResult.error} retryHref="/" />
  }

  return (
    <RecentListings
      products={productsResult.data}
      total={countResult.ok ? countResult.data : productsResult.data.length}
    />
  )
}

/**
 * Composição da home do marketplace.
 *
 * O hero e o conteúdo editorial são estáticos. Categorias e anúncios são
 * buscados no servidor e transmitidos dentro de limites de Suspense próprios.
 */
export function MarketplaceHome() {
  return (
    <main className="flex-1">
      <HeroSection />

      <div className="mx-auto w-full max-w-[1320px] space-y-14 px-4 py-12 sm:space-y-16 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <Suspense fallback={<CategoriesSectionSkeleton />}>
          <CategoriesSection />
        </Suspense>

        <Suspense fallback={<RecentListingsSkeleton />}>
          <RecentListingsSection />
        </Suspense>

        <SellCtaBanner />
        <TrustSection />
      </div>
    </main>
  )
}
