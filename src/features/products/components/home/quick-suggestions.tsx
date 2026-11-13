import Link from "next/link"

import { popularSearches } from "../../data/marketplace-content"

/**
 * Termos em alta exibidos abaixo da busca principal.
 */
export function QuickSuggestions() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
      <span className="font-medium text-foreground">Em alta no Pará:</span>

      {popularSearches.map((search) => (
        <Link
          key={search.query}
          href={`/products?q=${encodeURIComponent(search.query)}`}
          className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-3.5 py-1 text-label-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary-muted hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {search.label}
        </Link>
      ))}
    </div>
  )
}
