import {
  Bike,
  Car,
  Gamepad2,
  Headphones,
  Laptop,
  Package,
  Shirt,
  Smartphone,
  Sofa,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type {
  ProductCategorySummary,
  ProductCondition,
  ProductSort,
} from "../types/product.types"
import type { Category, CategoryTone } from "../types/marketplace.types"

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "Novo",
  like_new: "Seminovo",
  excellent: "Excelente",
  good: "Bom estado",
}

export const PRODUCT_CONDITION_OPTIONS = (
  Object.entries(CONDITION_LABELS) as [ProductCondition, string][]
).map(([value, label]) => ({ value, label }))

export const PRODUCT_SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
]

/**
 * Regiões usadas no header e no catálogo.
 *
 * O valor enviado na URL é o polo (compartilhável e estável) e o serviço
 * traduz para os municípios que pertencem a ele.
 */
export const LOCATION_OPTIONS: {
  value: string
  label: string
  cities: string[]
}[] = [
  {
    value: "belem",
    label: "Belém e Região Metropolitana",
    cities: ["Belém", "Ananindeua", "Marituba"],
  },
  {
    value: "castanhal",
    label: "Castanhal e Nordeste do Pará",
    cities: ["Castanhal"],
  },
  {
    value: "santarem",
    label: "Santarém e Oeste do Pará",
    cities: ["Santarém"],
  },
  {
    value: "maraba",
    label: "Marabá e Sudeste do Pará",
    cities: ["Marabá"],
  },
  {
    value: "salinas",
    label: "Salinópolis e Costa Atlântica",
    cities: ["Salinópolis"],
  },
]

export function getLocationCities(value: string | null): string[] | null {
  if (!value) {
    return null
  }

  return LOCATION_OPTIONS.find((option) => option.value === value)?.cities ?? null
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  celulares: Smartphone,
  eletronicos: Headphones,
  informatica: Laptop,
  "casa-moveis": Sofa,
  veiculos: Car,
  moda: Shirt,
  games: Gamepad2,
  esportes: Bike,
}

const CATEGORY_TONES: Record<string, CategoryTone> = {
  celulares: "primary",
  eletronicos: "secondary",
  informatica: "featured",
  "casa-moveis": "success",
  veiculos: "warning",
  moda: "primary",
  games: "secondary",
  esportes: "success",
}

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Package
}

export function getCategoryTone(slug: string): CategoryTone {
  return CATEGORY_TONES[slug] ?? "primary"
}

/**
 * Converte a categoria vinda do banco no modelo de apresentação da home.
 */
export function mapCategorySummaryToCategory(
  category: ProductCategorySummary,
): Category {
  return {
    id: category.slug,
    name: category.name,
    icon: getCategoryIcon(category.slug),
    count: category.count,
    tone: getCategoryTone(category.slug),
    href: `/products?category=${encodeURIComponent(category.slug)}`,
  }
}
