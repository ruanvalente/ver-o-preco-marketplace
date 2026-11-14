import { Suspense } from "react"
import Link from "next/link"

import { Skeleton } from "@/components/ui/skeleton"
import { CategoryNav } from "@/features/products/components/category-nav"
import { marketplacePolos } from "@/features/products/data/marketplace-content"
import { categoryNavigationItems } from "@/features/products/data/category-navigation"

import { BrandLogo } from "./brand-logo"
import { HeaderSearchForm } from "./header-search-form"
import { LocationSelector } from "./location-selector"
import { MarketplaceAccountArea } from "./marketplace-account-area"
import { MarketplaceMobileAccount } from "./marketplace-mobile-account"
import { MarketplaceMobileMenu } from "./marketplace-mobile-menu"
import { MarketplaceCreateListingAction } from "./marketplace-create-listing-action"

const mobileMenuCategories = categoryNavigationItems.filter(
  (item) => item.id !== "todas",
)

/**
 * Header do marketplace.
 *
 * Composto por Server Components, exceto o menu mobile (Sheet) e a barra de
 * categorias, que precisam de interação/rota ativa no cliente.
 */
export function MarketplaceHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center gap-3">
          <Link
            href="/"
            aria-label="Ver-o-Preço — página inicial"
            className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <BrandLogo />
          </Link>

          <div className="hidden lg:block">
            <LocationSelector />
          </div>

          <div className="hidden min-w-0 flex-1 justify-center md:flex">
            <HeaderSearchForm className="w-full max-w-xl" />
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Suspense
              fallback={
                <Skeleton
                  aria-hidden="true"
                  className="size-10 rounded-full"
                />
              }
            >
              <MarketplaceAccountArea />
            </Suspense>

            <Suspense fallback={null}>
              <MarketplaceCreateListingAction placement="header" />
            </Suspense>

            <MarketplaceMobileMenu
              polos={marketplacePolos}
              categories={mobileMenuCategories}
              accountAction={
                <Suspense
                  fallback={
                    <Skeleton className="h-11 w-full rounded-full" />
                  }
                >
                  <MarketplaceMobileAccount />
                </Suspense>
              }
            />
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <HeaderSearchForm id="header-search-mobile" />
        </div>
      </div>

      <CategoryNav />
    </header>
  )
}
