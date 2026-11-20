import { describe, expect, it } from "vitest"

import {
  formatProductLocation,
  isProductSearchRow,
  mapProductDetail,
  mapProductSearchRow,
  mapProductSummary,
  type MapProductOptions,
  type ProductRow,
  type ProductSearchRow,
} from "../utils/product-mappers"

const referenceDate = "2026-10-30T12:00:00.000Z"

const options: MapProductOptions = {
  referenceDate,
  resolveImageUrl: (storagePath) => `https://cdn.example.com/${storagePath}`,
}

const baseRow: ProductRow = {
  id: "product-1",
  title: "iPhone 15 Pro",
  description: "  Excelente estado.  ",
  price: "4500.00",
  condition: "like_new",
  city: "Belém",
  neighborhood: "Nazaré",
  created_at: "2026-10-29T12:00:00.000Z",
  category: { id: "category-1", slug: "celulares", name: "Celulares" },
  seller: {
    id: "seller-1",
    display_name: "Ana Souza",
    avatar_path: null,
    location: "Belém",
  },
  images: [
    {
      id: "image-2",
      storage_path: "seller/image-2.png",
      alt_text: null,
      sort_order: 2,
      is_primary: false,
    },
    {
      id: "image-1",
      storage_path: "seller/image-1.png",
      alt_text: "Foto principal",
      sort_order: 0,
      is_primary: true,
    },
    {
      id: "image-3",
      storage_path: "seller/image-3.png",
      alt_text: null,
      sort_order: 1,
      is_primary: false,
    },
  ],
}

describe("formatProductLocation", () => {
  it("combines city and neighborhood", () => {
    expect(formatProductLocation("Belém", "Nazaré")).toEqual({
      city: "Belém",
      neighborhood: "Nazaré",
      label: "Belém - Nazaré",
    })
  })

  it("uses only the city when the neighborhood is empty", () => {
    expect(formatProductLocation("Castanhal", "   ")).toEqual({
      city: "Castanhal",
      neighborhood: null,
      label: "Castanhal",
    })
  })
})

describe("mapProductSummary", () => {
  it("maps a Supabase row to the canonical model", () => {
    const product = mapProductSummary(baseRow, options)

    expect(product.price).toBe(4500)
    expect(product.condition).toBe("like_new")
    expect(product.location.label).toBe("Belém - Nazaré")
    expect(product.image).toEqual({
      id: "image-1",
      url: "https://cdn.example.com/seller/image-1.png",
      alt: "Foto principal",
      sortOrder: 0,
      isPrimary: true,
    })
    expect(product.seller).toEqual({
      id: "seller-1",
      displayName: "Ana Souza",
    })
    expect(product.category).toEqual({
      id: "category-1",
      slug: "celulares",
      name: "Celulares",
    })
    expect(product.publishedLabel).toBe("Há 1 dia")
  })

  it("uses the first image when none is marked as primary", () => {
    const row: ProductRow = {
      ...baseRow,
      images: baseRow.images?.map((image) => ({
        ...image,
        is_primary: false,
      })) ?? null,
    }

    const product = mapProductSummary(row, options)

    expect(product.image?.id).toBe("image-1")
    expect(product.image?.alt).toBe("Foto principal")
  })

  it("uses the title as alt text when the image has no description", () => {
    const row: ProductRow = {
      ...baseRow,
      images: [
        {
          id: "image-1",
          storage_path: "seller/image-1.png",
          alt_text: "   ",
          sort_order: 0,
          is_primary: true,
        },
      ],
    }

    expect(mapProductSummary(row, options).image?.alt).toBe("iPhone 15 Pro")
  })

  it("handles missing relations and unknown conditions", () => {
    const row: ProductRow = {
      ...baseRow,
      condition: "unknown",
      category: null,
      seller: null,
      images: null,
    }

    const product = mapProductSummary(row, options)

    expect(product.condition).toBe("good")
    expect(product.category).toEqual({
      id: "",
      slug: "outros",
      name: "Outros",
    })
    expect(product.seller).toEqual({ id: "", displayName: "Vendedor" })
    expect(product.image).toBeNull()
  })

  it("accepts relations returned as an array", () => {
    const row: ProductRow = {
      ...baseRow,
      category: [{ id: "category-1", slug: "celulares", name: "Celulares" }],
      seller: [
        {
          id: "seller-1",
          display_name: "Ana Souza",
          avatar_path: null,
          location: null,
        },
      ],
    }

    const product = mapProductSummary(row, options)

    expect(product.category.slug).toBe("celulares")
    expect(product.seller.displayName).toBe("Ana Souza")
  })
})

describe("mapProductDetail", () => {
  it("includes description, ordered gallery and full seller data", () => {
    const product = mapProductDetail(baseRow, options)

    expect(product.description).toBe("Excelente estado.")
    expect(product.images.map((image) => image.id)).toEqual([
      "image-1",
      "image-3",
      "image-2",
    ])
    expect(product.seller).toEqual({
      id: "seller-1",
      displayName: "Ana Souza",
      avatarUrl: null,
      location: "Belém",
    })
  })

  it("only exposes the avatar when it is already a usable URL", () => {
    const row: ProductRow = {
      ...baseRow,
      seller: {
        id: "seller-1",
        display_name: "Ana Souza",
        avatar_path: "avatars/ana.png",
        location: "Belém",
      },
    }

    expect(mapProductDetail(row, options).seller.avatarUrl).toBeNull()

    const rowWithUrl: ProductRow = {
      ...row,
      seller: {
        id: "seller-1",
        display_name: "Ana Souza",
        avatar_path: "/avatars/ana.png",
        location: "Belém",
      },
    }

    expect(mapProductDetail(rowWithUrl, options).seller.avatarUrl).toBe(
      "/avatars/ana.png",
    )
  })

  it("uses an empty description when the listing has no text", () => {
    const row: ProductRow = { ...baseRow, description: "   " }

    expect(mapProductDetail(row, options).description).toBe("")
  })
})

describe("mapProductSearchRow", () => {
  const searchRow: ProductSearchRow = {
    id: baseRow.id,
    title: baseRow.title,
    description: baseRow.description ?? null,
    price: baseRow.price,
    condition: baseRow.condition,
    city: baseRow.city,
    neighborhood: baseRow.neighborhood,
    created_at: baseRow.created_at,
    category_id: "category-1",
    category_slug: "celulares",
    category_name: "Celulares",
    seller_id: "seller-1",
    seller_display_name: "Ana Souza",
    seller_avatar_path: null,
    seller_location: "Belém",
    primary_image_path: "seller/image-1.png",
    primary_image_alt: "Foto principal",
    rank: 0.6,
    total_count: 3,
  }

  it("validates the flat row returned by the RPC", () => {
    expect(isProductSearchRow(searchRow)).toBe(true)
    expect(isProductSearchRow(null)).toBe(false)
    expect(isProductSearchRow({ ...searchRow, title: undefined })).toBe(false)
    expect(isProductSearchRow({ ...searchRow, total_count: "abc" })).toBe(true)
  })

  it("reuses the canonical mapper with the synthetic primary image", () => {
    const product = mapProductSearchRow(searchRow, options)

    expect(product.id).toBe(baseRow.id)
    expect(product.category).toEqual({
      id: "category-1",
      slug: "celulares",
      name: "Celulares",
    })
    expect(product.seller).toEqual({
      id: "seller-1",
      displayName: "Ana Souza",
    })
    expect(product.image).toEqual({
      id: `${baseRow.id}-primary`,
      url: "https://cdn.example.com/seller/image-1.png",
      alt: "Foto principal",
      sortOrder: 0,
      isPrimary: true,
    })
  })

  it("returns a null image when the RPC has no image path", () => {
    expect(
      mapProductSearchRow({ ...searchRow, primary_image_path: null }, options)
        .image,
    ).toBeNull()
  })
})
