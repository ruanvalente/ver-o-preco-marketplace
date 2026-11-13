"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

import {
  categoryNavigationItems,
  myListingsNavigationItem,
  type CategoryNavigationItem,
} from "../data/category-navigation"

type CategoryNavLinksProps = {
  activeId: string | null
}

function CategoryNavLinks({ activeId }: CategoryNavLinksProps) {
  return (
    <ul className="flex items-center gap-1 overflow-x-auto py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categoryNavigationItems.map((item: CategoryNavigationItem) => {
        const isActive = activeId === item.id

        return (
          <li key={item.id} className="shrink-0">
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                isActive
                  ? "bg-primary-muted text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}

      <li className="shrink-0" aria-hidden="true">
        <span className="mx-1 block h-6 w-px bg-border" />
      </li>

      <li className="shrink-0">
        <Link
          href={myListingsNavigationItem.href}
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap text-secondary-strong transition-colors hover:bg-secondary-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Plus aria-hidden="true" className="size-4" />
          {myListingsNavigationItem.label}
        </Link>
      </li>
    </ul>
  )
}

function ActiveCategoryNavLinks() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (pathname === "/") {
    return <CategoryNavLinks activeId="todas" />
  }

  if (pathname === "/products") {
    return <CategoryNavLinks activeId={searchParams.get("category")} />
  }

  return <CategoryNavLinks activeId={null} />
}

/**
 * Barra de categorias do marketplace.
 *
 * Client Component para refletir a categoria ativa a partir da URL. O bloco que
 * lê `searchParams` fica sob Suspense para não tornar toda a navegação estática
 * dependente da query string.
 */
export function CategoryNav() {
  return (
    <nav
      aria-label="Categorias do marketplace"
      className="border-t border-border bg-card"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<CategoryNavLinks activeId={null} />}>
          <ActiveCategoryNavLinks />
        </Suspense>
      </div>
    </nav>
  )
}
