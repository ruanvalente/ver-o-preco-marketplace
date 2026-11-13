import {
  PRODUCT_CONDITIONS,
  PRODUCT_STATUSES,
  type ProductCategory,
  type ProductCondition,
  type ProductStatus,
} from "@/features/products/types/product.types"
import { formatProductLocation } from "@/features/products/utils/product-mappers"

import type {
  Listing,
  ListingImage,
  ListingSummary,
} from "../types/listing.types"

/**
 * Linhas do Supabase.
 *
 * Estes tipos ficam restritos à camada de serviço/mapeamento. Componentes
 * recebem apenas o modelo canônico de `listing.types.ts`.
 */

export type ListingImageRow = {
  id: string
  storage_path: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
}

export type ListingCategoryRow = {
  id: string
  slug: string
  name: string
}

export type ListingRow = {
  id: string
  seller_id: string
  title: string
  description: string | null
  price: number | string
  condition: string
  city: string
  neighborhood: string | null
  status: string
  created_at: string
  updated_at: string
  category: ListingCategoryRow | ListingCategoryRow[] | null
  images: ListingImageRow[] | null
}

export type MapListingOptions = {
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

function toListingStatus(value: string): ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value)
    ? (value as ProductStatus)
    : "draft"
}

function mapCategory(row: ListingCategoryRow | null): ProductCategory {
  if (!row) {
    return { id: "", slug: "outros", name: "Outros" }
  }

  return { id: row.id, slug: row.slug, name: row.name }
}

export function mapListingImageRow(
  row: ListingImageRow,
  fallbackAlt: string,
  options: MapListingOptions,
): ListingImage {
  return {
    id: row.id,
    storagePath: row.storage_path,
    url: options.resolveImageUrl(row.storage_path),
    alt: row.alt_text?.trim() || fallbackAlt,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
  }
}

function mapImages(
  rows: ListingImageRow[] | null,
  fallbackAlt: string,
  options: MapListingOptions,
): ListingImage[] {
  return (rows ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => mapListingImageRow(row, fallbackAlt, options))
}

function pickPrimaryImage(images: ListingImage[]): ListingImage | null {
  return images.find((image) => image.isPrimary) ?? images[0] ?? null
}

export function mapListing(
  row: ListingRow,
  options: MapListingOptions,
): Listing {
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description?.trim() ?? "",
    category: mapCategory(firstRelation(row.category)),
    price: Number(row.price),
    condition: toProductCondition(row.condition),
    location: formatProductLocation(row.city, row.neighborhood),
    status: toListingStatus(row.status),
    images: mapImages(row.images, row.title, options),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapListingSummary(
  row: ListingRow,
  options: MapListingOptions,
): ListingSummary {
  const images = mapImages(row.images, row.title, options)

  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    condition: toProductCondition(row.condition),
    status: toListingStatus(row.status),
    location: formatProductLocation(row.city, row.neighborhood),
    image: pickPrimaryImage(images),
    category: mapCategory(firstRelation(row.category)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
