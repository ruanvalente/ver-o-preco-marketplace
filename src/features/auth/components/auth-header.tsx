import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { BrandLogo } from "./brand-logo"

/**
 * Header exclusivo das telas de entrada.
 * A altura fixa mantém o alinhamento entre login, cadastro e recuperação.
 */
export function AuthHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <BrandLogo />
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar à Home
        </Link>
      </div>
    </header>
  )
}
