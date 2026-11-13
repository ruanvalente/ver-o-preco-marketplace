import { ArrowRight, ChevronDown, MapPin } from "lucide-react"

import { marketplacePolos } from "@/features/products/data/marketplace-content"
import { cn } from "@/lib/utils"

type LocationSelectorProps = {
  id?: string
  className?: string
}

/**
 * Seletor de região do header.
 *
 * Formulário GET nativo: a região escolhida vira parâmetro de busca do
 * catálogo, sem depender de estado no cliente.
 */
export function LocationSelector({
  id = "header-location",
  className,
}: LocationSelectorProps) {
  return (
    <form
      action="/products"
      method="get"
      role="search"
      aria-label="Filtrar anúncios por região"
      className={cn(
        "flex h-11 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20",
        className,
      )}
    >
      <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />

      <label htmlFor={id} className="sr-only">
        Região
      </label>
      <div className="relative flex min-w-0 items-center">
        <select
          id={id}
          name="location"
          defaultValue="belem"
          className="h-11 max-w-52 appearance-none bg-transparent pr-5 text-sm font-medium text-foreground outline-none"
        >
          {marketplacePolos.map((polo) => (
            <option key={polo.value} value={polo.value}>
              {polo.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-0 size-3.5 text-muted-foreground"
        />
      </div>

      <button
        type="submit"
        aria-label="Aplicar região selecionada"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </form>
  )
}
