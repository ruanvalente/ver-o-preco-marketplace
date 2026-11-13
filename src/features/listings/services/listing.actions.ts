"use server"

import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"

import { requireUser } from "@/features/auth/services/session.service"

import { validateListingForm } from "../schemas/listing.schemas"
import type { ListingActionState } from "../types/listing.types"
import { validateListingImagesForUser } from "./listing-image.service"
import {
  createListing,
  deleteListing,
  pauseListing,
  publishListing,
  updateListing,
} from "./listing.service"

function revalidateListingViews(listingId?: string) {
  updateTag("products")
  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/listings")

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

  const user = await requireUser(`/listings/${listingId}/edit`)
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
  const user = await requireUser("/listings")
  const listingId = formData.get("listingId")
  const intent = parseStatusIntent(formData.get("intent"))

  if (typeof listingId !== "string" || !intent) {
    redirect("/listings?error=invalid")
  }

  if (intent === "delete") {
    const result = await deleteListing(user.id, listingId)

    if (!result.ok) {
      redirect("/listings?error=delete")
    }

    revalidateListingViews(listingId)
    redirect("/listings?deleted=1")
  }

  const result =
    intent === "publish"
      ? await publishListing(user.id, listingId)
      : await pauseListing(user.id, listingId)

  if (!result.ok) {
    redirect(`/listings?error=${intent}`)
  }

  revalidateListingViews(listingId)
  redirect(`/listings?updated=${intent === "publish" ? "published" : "paused"}`)
}
