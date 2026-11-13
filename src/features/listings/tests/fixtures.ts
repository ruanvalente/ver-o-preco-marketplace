import type { Listing, ListingSummary } from "../types/listing.types"

export const listingId = "11111111-1111-4111-8111-111111111111"
export const sellerId = "22222222-2222-4222-8222-222222222222"
export const categoryId = "33333333-3333-4333-8333-333333333333"

export const listingFixture: Listing = {
  id: listingId,
  sellerId,
  title: "iPhone 15 Pro 256GB Titânio Natural",
  description: "Aparelho em excelente estado, com caixa e cabo original.",
  category: {
    id: categoryId,
    slug: "celulares",
    name: "Celulares",
  },
  price: 4500,
  condition: "like_new",
  location: {
    city: "Belém",
    neighborhood: "Nazaré",
    label: "Belém - Nazaré",
  },
  status: "draft",
  images: [
    {
      id: "image-1",
      storagePath: `${sellerId}/photo-1.png`,
      url: "/products/iphone.png",
      alt: "Foto principal",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      id: "image-2",
      storagePath: `${sellerId}/photo-2.png`,
      url: "/products/iphone-back.png",
      alt: "Parte traseira",
      sortOrder: 1,
      isPrimary: false,
    },
  ],
  createdAt: "2026-10-29T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
}

export const listingSummaryFixture: ListingSummary = {
  id: listingFixture.id,
  title: listingFixture.title,
  price: listingFixture.price,
  condition: listingFixture.condition,
  status: "active",
  location: listingFixture.location,
  image: listingFixture.images[0],
  category: listingFixture.category,
  createdAt: listingFixture.createdAt,
  updatedAt: listingFixture.updatedAt,
}
