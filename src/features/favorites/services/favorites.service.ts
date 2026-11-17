import type { SupabaseClient } from "@supabase/supabase-js"
import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import type {
  ProductSummary,
  ServiceResult,
} from "@/features/products/types/product.types"
import {
  PRODUCT_SELECT,
  mapProductSummary,
  type ProductRow,
} from "@/features/products/utils/product-mappers"
import type { FavoriteCollection } from "../types/favorite.types"

const FAVORITE_PRODUCT_SELECT = `product:products!favorites_product_id_fkey (${PRODUCT_SELECT})`

const FAVORITES_LOAD_ERROR = "Não foi possível carregar seus favoritos."
const FAVORITE_SAVE_ERROR = "Não foi possível atualizar este favorito."
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const FAVORITE_IDS_SEPARATOR = "|"

type FavoriteProductRow = {
  product: ProductRow | ProductRow[] | null
}

function failure<T>(context: string, error: unknown): ServiceResult<T> {
  console.error(`[favorites] ${context}`, error)
  return { ok: false, error: FAVORITES_LOAD_ERROR }
}

function createMapperOptions(supabase: SupabaseClient) {
  return {
    referenceDate: new Date().toISOString(),
    resolveImageUrl: (storagePath: string) => {
      if (!storagePath) {
        return ""
      }

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
 * Lê os favoritos do usuário autenticado. O RLS limita o resultado ao dono
 * da sessão; `userId` só restringe novamente o conjunto da consulta.
 */
export async function getFavoriteProducts(
  userId: string,
  limit = 100,
): Promise<ServiceResult<FavoriteCollection>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("favorites")
      .select<
        typeof FAVORITE_PRODUCT_SELECT,
        FavoriteProductRow
      >(FAVORITE_PRODUCT_SELECT)
      .eq("user_id", userId)
      .eq("product.status", "active")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 200))

    if (error) {
      return failure("getFavoriteProducts", error)
    }

    const options = createMapperOptions(supabase)
    const rows = data ?? []
    const products: ProductSummary[] = []
    let unavailableCount = 0

    for (const row of rows) {
      const product = Array.isArray(row.product) ? row.product[0] : row.product

      if (!product) {
        unavailableCount += 1
        continue
      }

      products.push(mapProductSummary(product, options))
    }

    return { ok: true, data: { products, unavailableCount } }
  } catch (error) {
    return failure("getFavoriteProducts", error)
  }
}

/**
 * Normaliza os IDs em uma chave primitiva e estável.
 *
 * `cache()` do React memoiza por identidade dos argumentos; arrays criados por
 * cada call site seriam sempre diferentes. Ordenar e deduplicar os UUIDs antes
 * de gerar a chave garante uma única consulta por conjunto de produtos no
 * mesmo request, independentemente da ordem em que foram pedidos.
 */
function buildFavoriteIdsCacheKey(productIds: string[]): string {
  return [...new Set(productIds)]
    .filter((id) => UUID_PATTERN.test(id))
    .sort()
    .join(FAVORITE_IDS_SEPARATOR)
}

const fetchFavoriteProductIds = cache(
  async (cacheKey: string): Promise<ServiceResult<string[]>> => {
    const productIds = cacheKey.split(FAVORITE_IDS_SEPARATOR).filter(Boolean)

    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .in("product_id", productIds)

      if (error) {
        return failure("getFavoriteProductIds", error)
      }

      return {
        ok: true,
        data: (data ?? []).map((favorite) => favorite.product_id),
      }
    } catch (error) {
      return failure("getFavoriteProductIds", error)
    }
  },
)

/**
 * Busca os favoritos do usuário para um conjunto de produtos em uma consulta.
 *
 * O resultado é deduplicado por request (`cache()`), não entre requisições: a
 * política RLS continua sendo a única fonte de autorização e a sessão nunca é
 * compartilhada entre usuários.
 */
export function getFavoriteProductIds(
  productIds: string[],
): Promise<ServiceResult<string[]>> {
  const cacheKey = buildFavoriteIdsCacheKey(productIds)

  if (!cacheKey) {
    return Promise.resolve({ ok: true, data: [] })
  }

  return fetchFavoriteProductIds(cacheKey)
}

/**
 * Counts the authenticated user's favorites without loading product details.
 */
export async function getFavoriteCount(
  userId: string,
): Promise<ServiceResult<number>> {
  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)

    if (error) {
      return failure("getFavoriteCount", error)
    }

    return { ok: true, data: count ?? 0 }
  } catch (error) {
    return failure("getFavoriteCount", error)
  }
}

/**
 * Persiste o estado desejado. A identidade vem da sessão validada pelo action,
 * e a RLS ainda impede gravar ou remover favoritos de outra conta.
 */
export async function saveFavorite(
  userId: string,
  productId: string,
  isFavorite: boolean,
): Promise<ServiceResult<null>> {
  if (!UUID_PATTERN.test(productId)) {
    return { ok: false, error: FAVORITE_SAVE_ERROR }
  }

  try {
    const supabase = await createClient()

    if (isFavorite) {
      const { error } = await supabase.from("favorites").upsert(
        { user_id: userId, product_id: productId },
        { onConflict: "user_id,product_id", ignoreDuplicates: true },
      )

      if (error) {
        console.error("[favorites] saveFavorite", error)
        return { ok: false, error: FAVORITE_SAVE_ERROR }
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)

      if (error) {
        console.error("[favorites] saveFavorite", error)
        return { ok: false, error: FAVORITE_SAVE_ERROR }
      }
    }

    return { ok: true, data: null }
  } catch (error) {
    console.error("[favorites] saveFavorite", error)
    return { ok: false, error: FAVORITE_SAVE_ERROR }
  }
}
