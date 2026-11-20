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
 * Colunas explícitas usadas por toda leitura pública de produtos.
 *
 * Manter o select ao lado dos tipos de row evita drift entre a shape esperada
 * pelo mapper e o que o PostgREST devolve. Nenhuma coluna de contato do
 * vendedor (email/telefone) faz parte deste conjunto.
 */
export const PRODUCT_SELECT = `
  id,
  title,
  description,
  price,
  condition,
  city,
  neighborhood,
  created_at,
  category:categories!products_category_id_fkey ( id, slug, name ),
  seller:profiles!products_seller_id_fkey ( id, display_name, avatar_path, location ),
  images:product_images ( id, storage_path, alt_text, sort_order, is_primary )
`

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

/**
 * Flat row returned by `search_products`. Keeping it separate from ProductRow
 * prevents the RPC shape from leaking into the rest of the module.
 */
export type ProductSearchRow = {
  id: string
  title: string
  description: string | null
  price: number | string
  condition: string
  city: string
  neighborhood: string | null
  created_at: string
  category_id: string
  category_slug: string
  category_name: string
  seller_id: string
  seller_display_name: string | null
  seller_avatar_path: string | null
  seller_location: string | null
  primary_image_path: string | null
  primary_image_alt: string | null
  rank: number | string | null
  total_count: number | string | null
}

/** Runtime guard for the untyped payload returned by PostgREST RPCs. */
export function isProductSearchRow(value: unknown): value is ProductSearchRow {
  if (!value || typeof value !== "object") {
    return false
  }

  const row = value as Record<string, unknown>

  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    (typeof row.price === "number" || typeof row.price === "string") &&
    typeof row.condition === "string" &&
    typeof row.city === "string" &&
    typeof row.created_at === "string" &&
    typeof row.category_id === "string" &&
    typeof row.category_slug === "string" &&
    typeof row.category_name === "string" &&
    typeof row.seller_id === "string" &&
    (row.total_count === null ||
      typeof row.total_count === "number" ||
      typeof row.total_count === "string")
  )
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

export function mapProductSearchRow(
  row: ProductSearchRow,
  options: MapProductOptions,
): ProductSummary {
  const images: ProductImageRow[] = row.primary_image_path
    ? [
        {
          id: `${row.id}-primary`,
          storage_path: row.primary_image_path,
          alt_text: row.primary_image_alt,
          sort_order: 0,
          is_primary: true,
        },
      ]
    : []

  return mapProductSummary(
    {
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      condition: row.condition,
      city: row.city,
      neighborhood: row.neighborhood,
      created_at: row.created_at,
      category: {
        id: row.category_id,
        slug: row.category_slug,
        name: row.category_name,
      },
      seller: {
        id: row.seller_id,
        display_name: row.seller_display_name,
        avatar_path: row.seller_avatar_path,
        location: row.seller_location,
      },
      images,
    },
    options,
  )
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
