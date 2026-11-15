import { getSellerChatMetrics } from "@/features/chat/services/chat.service"
import { getOwnerListingDashboard } from "@/features/listings/services/listing.service"
import type { OwnerListingFilters } from "@/features/listings/types/listing.types"
import { getProfile } from "@/features/profile/services/profile.service"

import type { SellerDashboardData } from "../types/dashboard.types"

export async function getSellerDashboardData(
  sellerId: string,
  filters: OwnerListingFilters,
): Promise<SellerDashboardData> {
  const [profile, listings, chatMetrics] = await Promise.all([
    getProfile(sellerId),
    getOwnerListingDashboard(sellerId, filters),
    getSellerChatMetrics(sellerId),
  ])

  return { profile, listings, chatMetrics }
}
