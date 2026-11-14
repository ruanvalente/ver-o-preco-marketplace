import type {
  OwnerListingFilters,
  OwnerListingSort,
  OwnerListingStatusFilter,
} from "@/features/listings/types/listing.types"

type SearchParams = Record<string, string | string[] | undefined>

const LISTING_STATUSES: readonly OwnerListingStatusFilter[] = [
  "all",
  "active",
  "paused",
  "sold",
]
const LISTING_SORTS: readonly OwnerListingSort[] = [
  "recent",
  "price_asc",
  "price_desc",
]

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function positivePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 10_000) : 1
}

export function parseDashboardFilters(
  searchParams: SearchParams,
): OwnerListingFilters {
  const statusValue = firstValue(searchParams.status)
  const sortValue = firstValue(searchParams.sort)
  const status =
    LISTING_STATUSES.find((candidate) => candidate === statusValue) ?? "all"
  const sort =
    LISTING_SORTS.find((candidate) => candidate === sortValue) ?? "recent"

  return {
    status,
    query: (firstValue(searchParams.q) ?? "").trim().slice(0, 100),
    sort,
    page: positivePage(firstValue(searchParams.page)),
    pageSize: 6,
  }
}

export function buildDashboardHref(
  filters: OwnerListingFilters,
  overrides: Partial<OwnerListingFilters> = {},
): string {
  const merged: OwnerListingFilters = { ...filters, ...overrides }
  const params = new URLSearchParams()

  if (merged.status !== "all") {
    params.set("status", merged.status)
  }
  if (merged.query) {
    params.set("q", merged.query)
  }
  if (merged.sort !== "recent") {
    params.set("sort", merged.sort)
  }
  if (merged.page > 1) {
    params.set("page", String(merged.page))
  }

  const query = params.toString()
  return query ? `/dashboard?${query}` : "/dashboard"
}
