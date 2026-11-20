import { describe, expect, it } from "vitest"

import {
  isOwnerSearchRow,
  mapListing,
  mapListingSummary,
  mapOwnerSearchRow,
  type ListingRow,
  type MapListingOptions,
  type OwnerSearchRow,
} from "../utils/listing-mappers"
import { categoryId, listingId, sellerId } from "./fixtures"

const options: MapListingOptions = {
  resolveImageUrl: (storagePath) => `https://cdn.example.com/${storagePath}`,
}

const row: ListingRow = {
  id: listingId,
  seller_id: sellerId,
  title: "iPhone 15 Pro",
  description: "  Excelente estado.  ",
  price: "4500.00",
  condition: "like_new",
  city: "Belém",
  neighborhood: "Nazaré",
  status: "active",
  created_at: "2026-10-29T12:00:00.000Z",
  updated_at: "2026-10-30T12:00:00.000Z",
  category: { id: categoryId, slug: "celulares", name: "Celulares" },
  images: [
    {
      id: "image-2",
      storage_path: `${sellerId}/image-2.png`,
      alt_text: null,
      sort_order: 2,
      is_primary: false,
    },
    {
      id: "image-1",
      storage_path: `${sellerId}/image-1.png`,
      alt_text: "Foto principal",
      sort_order: 0,
      is_primary: true,
    },
    {
      id: "image-3",
      storage_path: `${sellerId}/image-3.png`,
      alt_text: null,
      sort_order: 1,
      is_primary: false,
    },
  ],
}

describe("mapListing", () => {
  it("maps a Supabase row to the canonical model", () => {
    const listing = mapListing(row, options)

    expect(listing.id).toBe(listingId)
    expect(listing.sellerId).toBe(sellerId)
    expect(listing.description).toBe("Excelente estado.")
    expect(listing.price).toBe(4500)
    expect(listing.condition).toBe("like_new")
    expect(listing.status).toBe("active")
    expect(listing.location).toEqual({
      city: "Belém",
      neighborhood: "Nazaré",
      label: "Belém - Nazaré",
    })
    expect(listing.category).toEqual({
      id: categoryId,
      slug: "celulares",
      name: "Celulares",
    })
  })

  it("sorts images by sort_order and resolves the URL", () => {
    const listing = mapListing(row, options)

    expect(listing.images.map((image) => image.id)).toEqual([
      "image-1",
      "image-3",
      "image-2",
    ])
    expect(listing.images[0].url).toBe(
      `https://cdn.example.com/${sellerId}/image-1.png`,
    )
  })

  it("uses the title as alt text when the image has no description", () => {
    const listing = mapListing(row, options)

    expect(listing.images[1].alt).toBe("iPhone 15 Pro")
    expect(listing.images[0].alt).toBe("Foto principal")
  })

  it("handles missing relations and unknown values", () => {
    const listing = mapListing(
      {
        ...row,
        condition: "unknown",
        status: "unknown",
        category: null,
        images: null,
        description: "   ",
      },
      options,
    )

    expect(listing.condition).toBe("good")
    expect(listing.status).toBe("draft")
    expect(listing.description).toBe("")
    expect(listing.category).toEqual({
      id: "",
      slug: "outros",
      name: "Outros",
    })
    expect(listing.images).toEqual([])
  })

  it("accepts relations returned as an array", () => {
    const listing = mapListing(
      {
        ...row,
        category: [{ id: categoryId, slug: "celulares", name: "Celulares" }],
      },
      options,
    )

    expect(listing.category.slug).toBe("celulares")
  })
})

describe("mapListingSummary", () => {
  it("uses the image marked as primary", () => {
    const summary = mapListingSummary(row, options)

    expect(summary.image?.id).toBe("image-1")
    expect(summary.image?.isPrimary).toBe(true)
  })

  it("uses the first image when none is marked as primary", () => {
    const summary = mapListingSummary(
      {
        ...row,
        images:
          row.images?.map((image) => ({ ...image, is_primary: false })) ?? null,
      },
      options,
    )

    expect(summary.image?.id).toBe("image-1")
  })

  it("returns a null image when the listing has no images", () => {
    expect(mapListingSummary({ ...row, images: null }, options).image).toBeNull()
  })
})

describe("mapOwnerSearchRow", () => {
  const searchRow: OwnerSearchRow = {
    id: row.id,
    seller_id: row.seller_id,
    title: row.title,
    description: row.description,
    price: row.price,
    condition: row.condition,
    city: row.city,
    neighborhood: row.neighborhood,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category_id: categoryId,
    category_slug: "celulares",
    category_name: "Celulares",
    primary_image_path: `${sellerId}/image-1.png`,
    primary_image_alt: "Foto principal",
    rank: 0.6,
    total_count: "2",
  }

  it("validates the flat row returned by the RPC", () => {
    expect(isOwnerSearchRow(searchRow)).toBe(true)
    expect(isOwnerSearchRow(undefined)).toBe(false)
    expect(isOwnerSearchRow({ ...searchRow, seller_id: null })).toBe(false)
  })

  it("keeps status and location in the seller summary", () => {
    const summary = mapOwnerSearchRow(searchRow, options)

    expect(summary.id).toBe(listingId)
    expect(summary.status).toBe("active")
    expect(summary.location.label).toBe("Belém - Nazaré")
    expect(summary.image?.id).toBe(`${listingId}-primary`)
    expect(summary.image?.url).toBe(
      `https://cdn.example.com/${sellerId}/image-1.png`,
    )
  })

  it("returns a null image when the RPC has no image path", () => {
    expect(
      mapOwnerSearchRow({ ...searchRow, primary_image_path: null }, options)
        .image,
    ).toBeNull()
  })
})
