import type {
  ProductCategory,
  ProductCondition,
  ProductLocation,
  ProductStatus,
} from "@/features/products/types/product.types"

/**
 * Canonical domain model for the listings module.
 *
 * The public catalog keeps using the products read model. Listings owns the
 * seller's write/lifecycle view, including storage paths and draft states.
 */

export type ListingStatus = ProductStatus

export type ListingImage = {
  id: string
  storagePath: string
  url: string
  alt: string
  sortOrder: number
  isPrimary: boolean
}

export type Listing = {
  id: string
  sellerId: string
  title: string
  description: string
  category: ProductCategory
  price: number
  condition: ProductCondition
  location: ProductLocation
  status: ListingStatus
  images: ListingImage[]
  createdAt: string
  updatedAt: string
}

export type ListingSummary = {
  id: string
  title: string
  price: number
  condition: ProductCondition
  status: ListingStatus
  location: ProductLocation
  image: ListingImage | null
  category: ProductCategory
  createdAt: string
  updatedAt: string
}

export type OwnerListingStatusFilter = "all" | "active" | "paused" | "sold"

export type OwnerListingSort = "recent" | "price_asc" | "price_desc"

export type OwnerListingFilters = {
  status: OwnerListingStatusFilter
  query: string
  sort: OwnerListingSort
  page: number
  pageSize: number
}

export type OwnerListingCounts = {
  all: number
  draft: number
  active: number
  paused: number
  sold: number
}

export type OwnerListingPage = {
  items: ListingSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type OwnerListingDashboard = {
  counts: OwnerListingCounts
  page: OwnerListingPage
}

export type ListingInput = {
  title: string
  description: string
  categoryId: string
  price: number
  condition: ProductCondition
  city: string
  neighborhood: string | null
}

export type ListingImageInput = {
  storagePath: string
  altText: string | null
  sortOrder: number
  isPrimary: boolean
}

export const LISTING_FORM_INTENTS = ["draft", "publish", "save"] as const

export type ListingFormIntent = (typeof LISTING_FORM_INTENTS)[number]

export type ListingFormData = {
  listingId?: string
  intent: ListingFormIntent
  input: ListingInput
  images: ListingImageInput[]
  removedImagePaths: string[]
}

export type ListingActionState = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: Record<string, string>
  listingId?: string
}

export const initialListingActionState: ListingActionState = { status: "idle" }

export type ListingServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export type ListingMutationFailure = {
  ok: false
  error: string
  /** Set when the listing already exists and can be reopened by the user. */
  listingId?: string
  /** Field that should receive inline feedback, when applicable. */
  field?: string
}

export type ListingMutationResult<T> =
  | { ok: true; data: T }
  | ListingMutationFailure
