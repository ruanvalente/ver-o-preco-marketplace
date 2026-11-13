import { ChevronDown, LayoutGrid, MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

import { marketplacePolos } from "../../data/marketplace-content"
import { categoryNavigationItems } from "../../data/category-navigation"

/**
 * Busca principal da home.
 *
 * Formulário GET real: o estado da busca vai para a URL do catálogo, o que
 * mantém a busca compartilhável, navegável e renderizável no servidor.
 */
export function HeroSearchBar() {
  return (
    <form
      action="/products"
      method="get"
      role="search"
      aria-label="Buscar produtos no marketplace"
      className="mt-8 w-full rounded-2xl border border-border bg-card p-2 shadow-card"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl bg-background px-3 sm:bg-transparent sm:px-2">
          <Search
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <label htmlFor="hero-search-query" className="sr-only">
            O que você está procurando?
          </label>
          <input
            id="hero-search-query"
            name="q"
            type="search"
            autoComplete="off"
            placeholder="O que você está procurando hoje?"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
          />
        </div>

        <span
          aria-hidden="true"
          className="hidden h-8 w-px shrink-0 bg-border sm:block"
        />

        <div className="relative flex h-12 items-center gap-2 rounded-xl bg-background px-3 sm:w-52 sm:bg-transparent sm:px-2">
          <MapPin
            aria-hidden="true"
            className="size-4 shrink-0 text-primary"
          />
          <label htmlFor="hero-search-location" className="sr-only">
            Localização
          </label>
          <select
            id="hero-search-location"
            name="location"
            defaultValue="belem"
            className="h-full w-full appearance-none bg-transparent pr-6 text-sm font-medium text-foreground outline-none"
          >
            {marketplacePolos.map((polo) => (
              <option key={polo.value} value={polo.value}>
                {polo.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 size-4 text-muted-foreground"
          />
        </div>

        <span
          aria-hidden="true"
          className="hidden h-8 w-px shrink-0 bg-border sm:block"
        />

        <div className="relative flex h-12 items-center gap-2 rounded-xl bg-background px-3 sm:w-44 sm:bg-transparent sm:px-2">
          <LayoutGrid
            aria-hidden="true"
            className="size-4 shrink-0 text-secondary-strong"
          />
          <label htmlFor="hero-search-category" className="sr-only">
            Categoria
          </label>
          <select
            id="hero-search-category"
            name="category"
            defaultValue=""
            className="h-full w-full appearance-none bg-transparent pr-6 text-sm font-medium text-foreground outline-none"
          >
            <option value="">Todas</option>
            {categoryNavigationItems
              .filter((category) => category.id !== "todas")
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 size-4 text-muted-foreground"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl px-5 text-base sm:ml-1 sm:w-auto sm:rounded-full"
        >
          <Search aria-hidden="true" className="size-4 sm:hidden" />
          Buscar agora
        </Button>
      </div>
    </form>
  )
}
