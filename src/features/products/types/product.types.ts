/**
 * Canonical read model for the products domain.
 *
 * These types describe the data the marketplace needs to display. Supabase row
 * shapes stay inside the service layer and are never exposed to components.
 */

export const PRODUCT_CONDITIONS = [
  "new",
  "like_new",
  "excellent",
  "good",
] as const;

export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

export const PRODUCT_STATUSES = [
  "draft",
  "active",
  "paused",
  "sold",
  "removed",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductSeller = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  location: string | null;
};

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
};

export type ProductLocation = {
  city: string;
  neighborhood: string | null;
  /** Human-readable location, e.g. `Belém - Nazaré`. */
  label: string;
};

export type ProductSummary = {
  id: string;
  title: string;
  price: number;
  condition: ProductCondition;
  location: ProductLocation;
  image: ProductImage | null;
  seller: Pick<ProductSeller, "id" | "displayName">;
  category: ProductCategory;
  publishedAt: string;
  /** Pre-computed relative label so cached pages stay deterministic. */
  publishedLabel: string;
};

export type ProductDetail = ProductSummary & {
  description: string;
  images: ProductImage[];
  seller: ProductSeller;
};

export type ProductCategorySummary = ProductCategory & {
  count: number;
};

export const PRODUCT_SORTS = ["recent", "price_asc", "price_desc"] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type ProductFilters = {
  q: string;
  category: string | null;
  condition: ProductCondition | null;
  minPrice: number | null;
  maxPrice: number | null;
  location: string | null;
  sort: ProductSort;
  page: number;
  pageSize: number;
};

export type ProductPage = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Services never throw for expected data-source failures. Pages decide whether
 * to render an empty state, an error state, or a not-found response.
 */
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
