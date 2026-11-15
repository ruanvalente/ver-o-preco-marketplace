import type { ProductSummary } from "@/features/products/types/product.types"

export type FavoriteCollection = {
  products: ProductSummary[]
  unavailableCount: number
}

export type FavoriteActionResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" }
  | { ok: false; reason: "error"; message: string }
