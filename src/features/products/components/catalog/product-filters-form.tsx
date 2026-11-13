import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type {
  ProductCategorySummary,
  ProductFilters,
} from "../../types/product.types"
import {
  LOCATION_OPTIONS,
  PRODUCT_CONDITION_OPTIONS,
} from "../../utils/catalog-options"
import { DEFAULT_PAGE_SIZE, hasActiveFilters } from "../../utils/query"

type ProductFiltersFormProps = {
  filters: ProductFilters
  categories: ProductCategorySummary[]
  idPrefix?: string
}

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

/**
 * Formulário de filtros do catálogo.
 *
 * Usa um `GET` nativo para que o estado da busca permaneça na URL e funcione
 * sem JavaScript.
 */
export function ProductFiltersForm({
  filters,
  categories,
  idPrefix = "filter",
}: ProductFiltersFormProps) {
  return (
    <form action="/products" method="get" className="space-y-5">
      <fieldset className="space-y-5">
        <legend className="sr-only">Filtros do catálogo</legend>

        {filters.sort !== "recent" && (
          <input type="hidden" name="sort" value={filters.sort} />
        )}
        {filters.pageSize !== DEFAULT_PAGE_SIZE && (
          <input type="hidden" name="pageSize" value={filters.pageSize} />
        )}

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-q`}>Buscar</Label>
          <Input
            id={`${idPrefix}-q`}
            name="q"
            type="search"
            autoComplete="off"
            defaultValue={filters.q}
            placeholder="Produto, marca ou modelo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-category`}>Categoria</Label>
          <select
            id={`${idPrefix}-category`}
            name="category"
            defaultValue={filters.category ?? ""}
            className={selectClassName}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-condition`}>Condição</Label>
          <select
            id={`${idPrefix}-condition`}
            name="condition"
            defaultValue={filters.condition ?? ""}
            className={selectClassName}
          >
            <option value="">Qualquer condição</option>
            {PRODUCT_CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Faixa de preço</span>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Label htmlFor={`${idPrefix}-min-price`} className="sr-only">
                Preço mínimo
              </Label>
              <Input
                id={`${idPrefix}-min-price`}
                name="minPrice"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                defaultValue={filters.minPrice ?? ""}
                placeholder="Mínimo"
              />
            </div>
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
            <div className="min-w-0 flex-1">
              <Label htmlFor={`${idPrefix}-max-price`} className="sr-only">
                Preço máximo
              </Label>
              <Input
                id={`${idPrefix}-max-price`}
                name="maxPrice"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                defaultValue={filters.maxPrice ?? ""}
                placeholder="Máximo"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-location`}>Localização</Label>
          <select
            id={`${idPrefix}-location`}
            name="location"
            defaultValue={filters.location ?? ""}
            className={selectClassName}
          >
            <option value="">Todo o Pará</option>
            {LOCATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Button type="submit" className="w-full">
          Aplicar filtros
        </Button>

        {hasActiveFilters(filters) && (
          <Button asChild variant="ghost" className="w-full">
            <Link href="/products">Limpar filtros</Link>
          </Button>
        )}
      </div>
    </form>
  )
}
