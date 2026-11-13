import Link from "next/link"

import {
  marketplaceFooterColumns,
  marketplaceFooterLegalLinks,
} from "@/features/products/data/marketplace-content"

import { BrandLogo } from "./brand-logo"

/**
 * Rodapé institucional do marketplace.
 */
export function MarketplaceFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <h2 className="sr-only">Informações, atendimento e links úteis</h2>

      <div className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))] lg:gap-8">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="Ver-o-Preço — página inicial"
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <BrandLogo />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              O marketplace regional do Pará para comprar e vender com quem está
              perto. Simples, local e sem taxas.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-success-surface px-3 py-1 text-label-sm font-medium text-success-strong">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-success"
              />
              Comércio local, negociação direta
            </p>
          </div>

          {marketplaceFooterColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © 2026 Ver-o-Preço Marketplace Pará. Todos os direitos reservados.
          </p>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {marketplaceFooterLegalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
