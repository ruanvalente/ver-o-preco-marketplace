import { cacheLife, cacheTag } from "next/cache"

import { getPublicSupabaseClient } from "@/lib/supabase/public"

import type {
  ProductCategorySummary,
  ProductDetail,
  ProductFilters,
  ProductPage,
  ProductSummary,
  ServiceResult,
} from "../types/product.types"
import { getLocationCities } from "../utils/catalog-options"
import {
  mapProductDetail,
  mapProductSummary,
  type MapProductOptions,
  type ProductRow,
} from "../utils/product-mappers"

const PRODUCT_SELECT = `
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const CATALOG_ERROR = "Não foi possível carregar os anúncios."
const DETAIL_ERROR = "Não foi possível carregar este anúncio."
const CATEGORIES_ERROR = "Não foi possível carregar as categorias."

function failure<T>(context: string, error: unknown): ServiceResult<T> {
  console.error(`[products] ${context}`, error)
  return { ok: false, error: CATALOG_ERROR }
}

function createMapperOptions(): MapProductOptions {
  const supabase = getPublicSupabaseClient()

  return {
    referenceDate: new Date().toISOString(),
    resolveImageUrl: (storagePath) => {
      if (!storagePath) {
        return ""
      }

      // Seeds locais e URLs absolutas já são utilizáveis pelo next/image.
      if (storagePath.startsWith("/") || storagePath.startsWith("http")) {
        return storagePath
      }

      return supabase.storage
        .from("product-images")
        .getPublicUrl(storagePath).data.publicUrl
    },
  }
}

/**
 * Sanitiza o termo de busca antes de montar o filtro `or` do PostgREST.
 *
 * Vírgulas e curingas são removidos para impedir que o texto digitado altere a
 * estrutura do filtro.
 */
function sanitizeSearchTerm(value: string): string {
  return value.replace(/[,%_()\\*]/g, " ").replace(/\s+/g, " ").trim()
}

export async function getProductCategories(): Promise<
  ServiceResult<ProductCategorySummary[]>
> {
  "use cache"
  cacheLife("hours")
  cacheTag("products")

  try {
    const supabase = getPublicSupabaseClient()
    const { data, error } = await supabase
      .from("category_listing_counts")
      .select("id, slug, name, product_count")
      .order("sort_order", { ascending: true })

    if (error) {
      return {
        ok: false,
        error: CATEGORIES_ERROR,
      }
    }

    return {
      ok: true,
      data: (data ?? []).map((row) => ({
        id: row.id as string,
        slug: row.slug as string,
        name: row.name as string,
        count: Number(row.product_count ?? 0),
      })),
    }
  } catch (error) {
    console.error("[products] getProductCategories", error)
    return { ok: false, error: CATEGORIES_ERROR }
  }
}

export async function getActiveProductCount(): Promise<ServiceResult<number>> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")

  try {
    const supabase = getPublicSupabaseClient()
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")

    if (error) {
      return failure("getActiveProductCount", error)
    }

    return { ok: true, data: count ?? 0 }
  } catch (error) {
    return failure("getActiveProductCount", error)
  }
}

export async function getRecentProducts(
  limit = 8,
): Promise<ServiceResult<ProductSummary[]>> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")

  try {
    const supabase = getPublicSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 24))

    if (error) {
      return failure("getRecentProducts", error)
    }

    const options = createMapperOptions()

    return {
      ok: true,
      data: ((data ?? []) as unknown as ProductRow[]).map((row) =>
        mapProductSummary(row, options),
      ),
    }
  } catch (error) {
    return failure("getRecentProducts", error)
  }
}

export async function getProducts(
  filters: ProductFilters,
): Promise<ServiceResult<ProductPage>> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")

  try {
    const supabase = getPublicSupabaseClient()

    let categoryId: string | null = null

    if (filters.category) {
      const categories = await getProductCategories()

      if (!categories.ok) {
        return { ok: false, error: categories.error }
      }

      categoryId =
        categories.data.find((category) => category.slug === filters.category)
          ?.id ?? null

      if (!categoryId) {
        return {
          ok: true,
          data: {
            items: [],
            total: 0,
            page: filters.page,
            pageSize: filters.pageSize,
            totalPages: 0,
          },
        }
      }
    }

    const from = (filters.page - 1) * filters.pageSize
    const to = from + filters.pageSize - 1

    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .eq("status", "active")

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    if (filters.condition) {
      query = query.eq("condition", filters.condition)
    }

    if (filters.minPrice !== null) {
      query = query.gte("price", filters.minPrice)
    }

    if (filters.maxPrice !== null) {
      query = query.lte("price", filters.maxPrice)
    }

    const cities = getLocationCities(filters.location)

    if (cities && cities.length > 0) {
      query = query.in("city", cities)
    }

    const searchTerm = sanitizeSearchTerm(filters.q)

    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
      )
    }

    switch (filters.sort) {
      case "price_asc":
        query = query.order("price", { ascending: true })
        break
      case "price_desc":
        query = query.order("price", { ascending: false })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      return failure("getProducts", error)
    }

    const total = count ?? 0
    const options = createMapperOptions()

    return {
      ok: true,
      data: {
        items: ((data ?? []) as unknown as ProductRow[]).map((row) =>
          mapProductSummary(row, options),
        ),
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    }
  } catch (error) {
    return failure("getProducts", error)
  }
}

export async function getProductById(
  id: string,
): Promise<ServiceResult<ProductDetail | null>> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")

  if (!UUID_PATTERN.test(id)) {
    return { ok: true, data: null }
  }

  try {
    const supabase = getPublicSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle()

    if (error) {
      console.error("[products] getProductById", error)
      return { ok: false, error: DETAIL_ERROR }
    }

    if (!data) {
      return { ok: true, data: null }
    }

    return {
      ok: true,
      data: mapProductDetail(
        data as unknown as ProductRow,
        createMapperOptions(),
      ),
    }
  } catch (error) {
    console.error("[products] getProductById", error)
    return { ok: false, error: DETAIL_ERROR }
  }
}

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
): Promise<ServiceResult<ProductSummary[]>> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")

  if (!categoryId || !UUID_PATTERN.test(categoryId)) {
    return { ok: true, data: [] }
  }

  try {
    const supabase = getPublicSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .eq("category_id", categoryId)
      .neq("id", excludeProductId)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 12))

    if (error) {
      return failure("getRelatedProducts", error)
    }

    const options = createMapperOptions()

    return {
      ok: true,
      data: ((data ?? []) as unknown as ProductRow[]).map((row) =>
        mapProductSummary(row, options),
      ),
    }
  } catch (error) {
    return failure("getRelatedProducts", error)
  }
}
