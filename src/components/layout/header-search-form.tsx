import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HeaderSearchFormProps = {
  id?: string
  className?: string
}

/**
 * Busca global do header.
 *
 * Formulário GET para o catálogo, mantendo o termo na URL e funcionando sem
 * JavaScript.
 */
export function HeaderSearchForm({
  id = "header-search-query",
  className,
}: HeaderSearchFormProps) {
  return (
    <form
      action="/products"
      method="get"
      role="search"
      aria-label="Busca global no marketplace"
      className={cn(
        "flex h-11 min-w-0 items-center gap-2 rounded-full border border-border bg-background pr-1.5 pl-3 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20",
        className,
      )}
    >
      <Search
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />

      <label htmlFor={id} className="sr-only">
        Buscar no marketplace
      </label>
      <input
        id={id}
        name="q"
        type="search"
        autoComplete="off"
        placeholder="Buscar no Ver-o-Preço"
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />

      <Button
        type="submit"
        size="icon-sm"
        className="rounded-full"
        aria-label="Buscar"
      >
        <Search aria-hidden="true" className="size-4" />
      </Button>
    </form>
  )
}
