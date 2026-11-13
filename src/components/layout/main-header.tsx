import Link from "next/link"
import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import { HeaderAuth } from "./header-auth"

export function MainHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-2">
        <Link
          href="/"
          className="rounded-sm text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Ver-o-Preço
        </Link>
        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-2 sm:gap-3"
        >
          <Link
            href="/"
            className="hidden rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:inline-flex"
          >
            Explorar
          </Link>
          <Suspense
            fallback={
              <div className="flex items-center gap-2" aria-hidden="true">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-24" />
              </div>
            }
          >
            <HeaderAuth />
          </Suspense>
        </nav>
      </div>
    </header>
  )
}
