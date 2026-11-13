import Link from "next/link"

import { BrandLogo } from "@/components/layout/brand-logo"
import { Button } from "@/components/ui/button"

import { landingNavItems } from "../data/landing-content"
import { MobileNav } from "./mobile-nav"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-[76px] w-full max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Ver-o-Preço — página inicial"
          className="rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <BrandLogo />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-0.5 xl:flex"
        >
          {landingNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <Button asChild variant="ghost" size="sm" className="h-10">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm" className="h-10">
            <Link href="/register">Anunciar produto</Link>
          </Button>
        </div>

        <MobileNav />
      </div>
    </header>
  )
}
