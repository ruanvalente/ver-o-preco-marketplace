import { notFound } from "next/navigation"

import { getProductCategories } from "@/features/products/services/products.service"

import { getListingForOwner } from "../services/listing.service"
import type { Listing } from "../types/listing.types"
import { ListingErrorState } from "./listing-error-state"
import { ListingForm, type ListingCategoryOption } from "./listing-form"

type ListingEditorProps = {
  mode: "create" | "edit"
  userId: string
  listingId?: string
}

/**
 * Carrega categorias e, na edição, o anúncio do próprio usuário.
 *
 * A busca por proprietário acontece antes de renderizar o formulário. Um
 * anúncio de outra pessoa (ou inexistente) resulta em `notFound`, sem revelar
 * se o registro existe.
 */
export async function ListingEditor({
  mode,
  userId,
  listingId,
}: ListingEditorProps) {
  const categoriesResult = await getProductCategories()

  if (!categoriesResult.ok) {
    return (
      <ListingErrorState
        message={categoriesResult.error}
        retryHref={mode === "edit" ? `/listings/${listingId}/edit` : "/listings/new"}
      />
    )
  }

  const categories: ListingCategoryOption[] = categoriesResult.data.map(
    (category) => ({ id: category.id, name: category.name }),
  )

  let listing: Listing | undefined

  if (mode === "edit") {
    if (!listingId) {
      notFound()
    }

    const listingResult = await getListingForOwner(userId, listingId)

    if (!listingResult.ok) {
      return (
        <ListingErrorState
          message={listingResult.error}
          retryHref={`/listings/${listingId}/edit`}
        />
      )
    }

    if (!listingResult.data) {
      notFound()
    }

    listing = listingResult.data
  }

  return (
    <ListingForm
      mode={mode}
      userId={userId}
      categories={categories}
      listing={listing}
    />
  )
}
