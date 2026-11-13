import type {
  ProductCategorySummary,
  ProductDetail,
  ProductSummary,
} from "../types/product.types"

export const productSummaryFixture: ProductSummary = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "iPhone 15 Pro 256GB Titânio Natural",
  price: 4500,
  condition: "like_new",
  location: {
    city: "Belém",
    neighborhood: "Nazaré",
    label: "Belém - Nazaré",
  },
  image: {
    id: "image-1",
    url: "/products/iphone.png",
    alt: "iPhone 15 Pro na cor titânio natural",
    sortOrder: 0,
    isPrimary: true,
  },
  seller: {
    id: "22222222-2222-4222-8222-222222222222",
    displayName: "Ana Souza",
  },
  category: {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "celulares",
    name: "Celulares",
  },
  publishedAt: "2026-10-29T12:00:00.000Z",
  publishedLabel: "Há 2 dias",
}

export const secondProductSummaryFixture: ProductSummary = {
  ...productSummaryFixture,
  id: "44444444-4444-4444-8444-444444444444",
  title: "Fone Bluetooth com cancelamento de ruído",
  price: 320,
  condition: "new",
  location: {
    city: "Castanhal",
    neighborhood: null,
    label: "Castanhal",
  },
  image: null,
  seller: {
    id: "55555555-5555-4555-8555-555555555555",
    displayName: "Bruno Lima",
  },
  category: {
    id: "66666666-6666-4666-8666-666666666666",
    slug: "eletronicos",
    name: "Eletrônicos",
  },
  publishedLabel: "Há 3 horas",
}

export const productDetailFixture: ProductDetail = {
  ...productSummaryFixture,
  description:
    "iPhone 15 Pro em excelente estado, com caixa e cabo original.",
  images: [
    {
      id: "image-1",
      url: "/products/iphone.png",
      alt: "iPhone 15 Pro na cor titânio natural",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      id: "image-2",
      url: "/products/iphone-back.png",
      alt: "Parte traseira do iPhone 15 Pro",
      sortOrder: 1,
      isPrimary: false,
    },
  ],
  seller: {
    id: "22222222-2222-4222-8222-222222222222",
    displayName: "Ana Souza",
    avatarUrl: null,
    location: "Belém",
  },
}

export const categorySummaryFixture: ProductCategorySummary = {
  id: "33333333-3333-4333-8333-333333333333",
  slug: "celulares",
  name: "Celulares",
  count: 12,
}
