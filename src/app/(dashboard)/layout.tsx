import type { ReactNode } from "react"

import { MarketplaceFooter, MarketplaceHeader } from "@/components/layout"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <MarketplaceHeader />
      {children}
      <MarketplaceFooter />
    </div>
  )
}
