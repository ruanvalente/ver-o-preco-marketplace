import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { BrandLogo } from "./brand-logo"
import { SecurityBadge } from "./security-badge"

export function AuthHeader() {
  return (
    <header className="border-b border-border/80 bg-white">
      <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <div className="flex items-center gap-3">
          <SecurityBadge className="hidden sm:inline-flex" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Voltar à Home
          </Link>
        </div>
      </div>
    </header>
  )
}
