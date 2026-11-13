import { describe, expect, it } from "vitest"

import {
  mapListing,
  mapListingSummary,
  type ListingRow,
  type MapListingOptions,
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
  it("mapeia a linha do Supabase para o modelo canônico", () => {
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

  it("ordena as imagens por sort_order e resolve a URL", () => {
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

  it("usa o título como texto alternativo quando a imagem não tem descrição", () => {
    const listing = mapListing(row, options)

    expect(listing.images[1].alt).toBe("iPhone 15 Pro")
    expect(listing.images[0].alt).toBe("Foto principal")
  })

  it("trata relações ausentes e valores desconhecidos", () => {
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

  it("aceita relações retornadas como array", () => {
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
  it("usa a imagem marcada como principal", () => {
    const summary = mapListingSummary(row, options)

    expect(summary.image?.id).toBe("image-1")
    expect(summary.image?.isPrimary).toBe(true)
  })

  it("usa a primeira imagem quando nenhuma é marcada como principal", () => {
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

  it("retorna imagem nula quando o anúncio não tem imagens", () => {
    expect(mapListingSummary({ ...row, images: null }, options).image).toBeNull()
  })
})
