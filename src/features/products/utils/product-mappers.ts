import {
  PRODUCT_CONDITIONS,
  type ProductCategory,
  type ProductCondition,
  type ProductDetail,
  type ProductImage,
  type ProductLocation,
  type ProductSeller,
  type ProductSummary,
} from "../types/product.types"
import { formatRelativeTime } from "./format"

/**
 * Linhas do Supabase.
 *
 * Estes tipos ficam restritos à camada de serviço/mapeamento. Componentes
 * recebem apenas o modelo canônico de `product.types.ts`.
 */
export type ProductImageRow = {
  id: string
  storage_path: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
}

export type ProductCategoryRow = {
  id: string
  slug: string
  name: string
}

export type ProductSellerRow = {
  id: string
  display_name: string | null
  avatar_path: string | null
  location: string | null
}

export type ProductRow = {
  id: string
  title: string
  description?: string | null
  price: number | string
  condition: string
  city: string
  neighborhood: string | null
  created_at: string
  category: ProductCategoryRow | ProductCategoryRow[] | null
  seller: ProductSellerRow | ProductSellerRow[] | null
  images: ProductImageRow[] | null
}

export type MapProductOptions = {
  referenceDate: string
  resolveImageUrl: (storagePath: string) => string
}

function firstRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

function toProductCondition(value: string): ProductCondition {
  return (PRODUCT_CONDITIONS as readonly string[]).includes(value)
    ? (value as ProductCondition)
    : "good"
}

export function formatProductLocation(
  city: string,
  neighborhood: string | null,
): ProductLocation {
  const trimmedNeighborhood = neighborhood?.trim() || null

  return {
    city,
    neighborhood: trimmedNeighborhood,
    label: trimmedNeighborhood ? `${city} - ${trimmedNeighborhood}` : city,
  }
}

function toProductImage(
  row: ProductImageRow,
  fallbackAlt: string,
  resolveImageUrl: MapProductOptions["resolveImageUrl"],
): ProductImage {
  return {
    id: row.id,
    url: resolveImageUrl(row.storage_path),
    alt: row.alt_text?.trim() || fallbackAlt,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
  }
}

function mapImages(
  rows: ProductImageRow[] | null,
  fallbackAlt: string,
  resolveImageUrl: MapProductOptions["resolveImageUrl"],
): ProductImage[] {
  return (rows ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => toProductImage(row, fallbackAlt, resolveImageUrl))
}

function pickPrimaryImage(images: ProductImage[]): ProductImage | null {
  return images.find((image) => image.isPrimary) ?? images[0] ?? null
}

function mapCategory(
  row: ProductCategoryRow | null,
): ProductCategory {
  if (!row) {
    return { id: "", slug: "outros", name: "Outros" }
  }

  return { id: row.id, slug: row.slug, name: row.name }
}

function mapSeller(row: ProductSellerRow | null): ProductSeller {
  const displayName = row?.display_name?.trim() || "Vendedor"
  const avatarPath = row?.avatar_path ?? null

  // Avatares só são exibidos quando já são uma URL utilizável. O bucket de
  // avatares pertence ao módulo de perfil e pode não existir neste ambiente.
  const avatarUrl =
    avatarPath && (avatarPath.startsWith("/") || avatarPath.startsWith("http"))
      ? avatarPath
      : null

  return {
    id: row?.id ?? "",
    displayName,
    avatarUrl,
    location: row?.location ?? null,
  }
}

export function mapProductSummary(
  row: ProductRow,
  options: MapProductOptions,
): ProductSummary {
  const images = mapImages(row.images, row.title, options.resolveImageUrl)

  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    condition: toProductCondition(row.condition),
    location: formatProductLocation(row.city, row.neighborhood),
    image: pickPrimaryImage(images),
    seller: {
      id: firstRelation(row.seller)?.id ?? "",
      displayName: mapSeller(firstRelation(row.seller)).displayName,
    },
    category: mapCategory(firstRelation(row.category)),
    publishedAt: row.created_at,
    publishedLabel: formatRelativeTime(row.created_at, options.referenceDate),
  }
}

export function mapProductDetail(
  row: ProductRow,
  options: MapProductOptions,
): ProductDetail {
  const images = mapImages(row.images, row.title, options.resolveImageUrl)

  return {
    ...mapProductSummary(row, options),
    description: row.description?.trim() || "",
    images,
    seller: mapSeller(firstRelation(row.seller)),
  }
}
