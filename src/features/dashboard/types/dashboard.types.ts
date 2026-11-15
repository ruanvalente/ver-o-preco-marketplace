import type {
  OwnerListingDashboard,
  OwnerListingFilters,
  ListingServiceResult,
} from "@/features/listings/types/listing.types"
import type {
  ChatServiceResult,
  SellerChatMetrics,
} from "@/features/chat/services/chat.service"
import type { Profile } from "@/features/profile/types/profile.types"

export type SellerDashboardData = {
  profile: Profile | null
  listings: ListingServiceResult<OwnerListingDashboard>
  chatMetrics: ChatServiceResult<SellerChatMetrics>
}

export type DashboardFilters = OwnerListingFilters

export type DashboardFeedback = {
  error?: string
  listingId?: string
  updated?: string
}
