import type { ReactNode } from "react"

import { MainHeader } from "@/components/layout"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <MainHeader />
      {children}
    </div>
  )
}
