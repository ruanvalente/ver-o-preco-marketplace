import type { ReactNode } from "react";

import { MarketplaceFooter, MarketplaceHeader } from "@/components/layout";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <MarketplaceHeader />
      {children}
      <MarketplaceFooter />
    </div>
  );
}
