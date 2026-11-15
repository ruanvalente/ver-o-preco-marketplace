"use server"

import { revalidatePath } from "next/cache"

import { getCurrentUser } from "@/features/auth/services/session.service"

import type { FavoriteActionResult } from "../types/favorite.types"
import { saveFavorite } from "./favorites.service"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function setFavoriteAction(
  productId: string,
  isFavorite: boolean,
): Promise<FavoriteActionResult> {
  if (typeof productId !== "string" || !UUID_PATTERN.test(productId)) {
    return {
      ok: false,
      reason: "error",
      message: "Não foi possível atualizar este favorito.",
    }
  }

  if (typeof isFavorite !== "boolean") {
    return {
      ok: false,
      reason: "error",
      message: "Não foi possível atualizar este favorito.",
    }
  }

  const user = await getCurrentUser()

  if (!user) {
    return { ok: false, reason: "unauthenticated" }
  }

  const result = await saveFavorite(user.id, productId, isFavorite)

  if (!result.ok) {
    return { ok: false, reason: "error", message: result.error }
  }

  revalidatePath("/favorites")
  return { ok: true }
}
