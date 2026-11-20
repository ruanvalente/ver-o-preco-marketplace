import { cacheLife, cacheTag } from "next/cache"

import { getPublicSupabaseClient } from "@/lib/supabase/public"

import {
  PRODUCTS_LIST_TAG,
  type ProductCategorySummary,
  type ProductDetail,
  type ProductFilters,
  type ProductPage,
  type ProductSummary,
  type ServiceResult,
} from "../types/product.types"
import { getLocationCities } from "../utils/catalog-options"
import {
  PRODUCT_SELECT,
  isProductSearchRow,
  mapProductDetail,
  mapProductSearchRow,
  mapProductSummary,
  type MapProductOptions,
  type ProductRow,
} from "../utils/product-mappers"

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

export async function getProductCategories(): Promise<
  ServiceResult<ProductCategorySummary[]>
> {
  "use cache"
  cacheLife("hours")
  cacheTag(PRODUCTS_LIST_TAG)

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
  cacheTag(PRODUCTS_LIST_TAG)

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
  cacheTag(PRODUCTS_LIST_TAG)

  try {
    const supabase = getPublicSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select<typeof PRODUCT_SELECT, ProductRow>(PRODUCT_SELECT)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 24))

    if (error) {
      return failure("getRecentProducts", error)
    }

    const options = createMapperOptions()

    return {
      ok: true,
      data: (data ?? []).map((row) => mapProductSummary(row, options)),
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
  cacheTag(PRODUCTS_LIST_TAG)

  try {
    const supabase = getPublicSupabaseClient()
    const from = (filters.page - 1) * filters.pageSize
    const cities = getLocationCities(filters.location)

    // Full-text search runs in the database: ranking, synonym expansion and
    // the total count all come from the same RPC call.
    if (filters.q.trim()) {
      const { data, error } = await supabase.rpc("search_products", {
        p_search_term: filters.q,
        p_category_slug: filters.category,
        p_min_price: filters.minPrice,
        p_max_price: filters.maxPrice,
        p_cities: cities,
        p_condition: filters.condition,
        p_limit: filters.pageSize,
        p_offset: from,
        p_sort: filters.sort,
      })

      if (error) {
        return failure("getProducts search", error)
      }

      if (!Array.isArray(data)) {
        return failure(
          "getProducts search",
          new Error("Resposta inesperada da busca"),
        )
      }

      const rows = data.filter(isProductSearchRow)

      if (rows.length !== data.length) {
        return failure("getProducts search", new Error("Linhas de busca inválidas"))
      }

      const total = rows.length > 0 ? Number(rows[0].total_count ?? 0) : 0

      if (!Number.isFinite(total)) {
        return failure("getProducts search", new Error("Total de busca inválido"))
      }

      const options = createMapperOptions()

      return {
        ok: true,
        data: {
          items: rows.map((row) => mapProductSearchRow(row, options)),
          total,
          page: filters.page,
          pageSize: filters.pageSize,
          totalPages: Math.ceil(total / filters.pageSize),
        },
      }
    }

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

    const to = from + filters.pageSize - 1

    let query = supabase
      .from("products")
      .select<typeof PRODUCT_SELECT, ProductRow>(PRODUCT_SELECT, {
        count: "exact",
      })
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

    if (cities && cities.length > 0) {
      query = query.in("city", cities)
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
        items: (data ?? []).map((row) => mapProductSummary(row, options)),
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
  cacheTag(PRODUCTS_LIST_TAG)

  if (!UUID_PATTERN.test(id)) {
    return { ok: true, data: null }
  }

  try {
    const supabase = getPublicSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select<typeof PRODUCT_SELECT, ProductRow>(PRODUCT_SELECT)
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
      data: mapProductDetail(data, createMapperOptions()),
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
  cacheTag(PRODUCTS_LIST_TAG)

  if (!categoryId || !UUID_PATTERN.test(categoryId)) {
    return { ok: true, data: [] }
  }

  try {
    const supabase = getPublicSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select<typeof PRODUCT_SELECT, ProductRow>(PRODUCT_SELECT)
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
      data: (data ?? []).map((row) => mapProductSummary(row, options)),
    }
  } catch (error) {
    return failure("getRelatedProducts", error)
  }
}
