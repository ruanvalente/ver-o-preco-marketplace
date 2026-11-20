"use server"

import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"

import {
  requireOwnership,
  requireUser,
} from "@/features/auth/services/session.service"
import { PRODUCTS_LIST_TAG } from "@/features/products/types/product.types"

import { isListingId, validateListingForm } from "../schemas/listing.schemas"
import type { ListingActionState } from "../types/listing.types"
import { validateListingImagesForUser } from "./listing-image.service"
import {
  NOT_FOUND_ERROR,
  createListing,
  deleteListing,
  pauseListing,
  publishListing,
  updateListing,
} from "./listing.service"

const OWNERSHIP_CHECK_ERROR =
  "Não foi possível verificar o anúncio. Tente novamente.";

function revalidateListingViews(listingId?: string) {
  updateTag(PRODUCTS_LIST_TAG)
  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/listings")
  revalidatePath("/dashboard")

  if (listingId) {
    revalidatePath(`/products/${listingId}`)
    revalidatePath(`/listings/${listingId}/edit`)
  }
}

export async function createListingAction(
  _previousState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const validation = validateListingForm(formData)

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors }
  }

  const user = await requireUser("/listings/new")
  const { input, images, intent } = validation.data

  const imageValidation = await validateListingImagesForUser(user.id, images)

  if (!imageValidation.ok) {
    return {
      status: "error",
      fieldErrors: { images: imageValidation.error },
    }
  }

  const result = await createListing({
    userId: user.id,
    input,
    images: imageValidation.data,
    publish: intent === "publish",
  })

  if (!result.ok) {
    return {
      status: "error",
      message: result.error,
      listingId: result.listingId,
      fieldErrors: result.field ? { [result.field]: result.error } : undefined,
    }
  }

  revalidateListingViews(result.data.id)
  redirect(`/listings?created=${intent === "publish" ? "published" : "draft"}`)
}

export async function updateListingAction(
  _previousState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const validation = validateListingForm(formData)

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors }
  }

  const { listingId, input, images, intent } = validation.data

  if (!listingId) {
    return { status: "error", message: "Anúncio inválido." }
  }

  const ownership = await requireOwnership(`/listings/${listingId}/edit`, listingId)

  if (!ownership.ok) {
    return {
      status: "error",
      message:
        ownership.reason === "unavailable"
          ? OWNERSHIP_CHECK_ERROR
          : NOT_FOUND_ERROR,
    }
  }

  const user = ownership.user
  const imageValidation = await validateListingImagesForUser(user.id, images)

  if (!imageValidation.ok) {
    return {
      status: "error",
      fieldErrors: { images: imageValidation.error },
      listingId,
    }
  }

  const result = await updateListing({
    userId: user.id,
    listingId,
    input,
    images: imageValidation.data,
    publish: intent === "publish",
  })

  if (!result.ok) {
    return {
      status: "error",
      message: result.error,
      listingId: result.listingId,
      fieldErrors: result.field ? { [result.field]: result.error } : undefined,
    }
  }

  revalidateListingViews(result.data.id)
  redirect(`/listings?updated=${intent === "publish" ? "published" : "saved"}`)
}

type ListingStatusIntent = "publish" | "pause" | "delete"

function parseStatusIntent(value: FormDataEntryValue | null): ListingStatusIntent | null {
  return value === "publish" || value === "pause" || value === "delete"
    ? value
    : null
}

/**
 * Ações de ciclo de vida acionadas pela lista de anúncios.
 *
 * Falhas redirecionam com um código curto de erro, nunca com a mensagem bruta
 * do Supabase. A página traduz o código em uma mensagem segura e acionável.
 */
export async function updateListingStatusAction(formData: FormData) {
  const returnTo =
    formData.get("returnTo") === "/dashboard" ? "/dashboard" : "/listings"
  const listingId = formData.get("listingId")
  const intent = parseStatusIntent(formData.get("intent"))

  if (typeof listingId !== "string" || !isListingId(listingId) || !intent) {
    redirect(`${returnTo}?error=invalid`)
  }

  const ownership = await requireOwnership(returnTo, listingId)

  if (!ownership.ok) {
    redirect(
      `${returnTo}?error=${ownership.reason === "unavailable" ? "unexpected" : "forbidden"}`,
    )
  }

  const { user } = ownership

  if (intent === "delete") {
    const result = await deleteListing(user.id, listingId)

    if (!result.ok) {
      redirect(`${returnTo}?error=delete`)
    }

    revalidateListingViews(listingId)
    redirect(`${returnTo}?deleted=1`)
  }

  const result =
    intent === "publish"
      ? await publishListing(user.id, listingId)
      : await pauseListing(user.id, listingId)

  if (!result.ok) {
    const listingParam = isListingId(listingId)
      ? `&listingId=${encodeURIComponent(listingId)}`
      : ""
    redirect(`${returnTo}?error=${intent}${listingParam}`)
  }

  revalidateListingViews(listingId)
  redirect(
    `${returnTo}?updated=${intent === "publish" ? "published" : "paused"}`,
  )
}
