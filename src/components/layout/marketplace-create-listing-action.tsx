"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type MarketplaceCreateListingActionProps = {
  placement: "header" | "mobile"
}

export function MarketplaceCreateListingAction({
  placement,
}: MarketplaceCreateListingActionProps) {
  const pathname = usePathname()

  if (pathname === "/dashboard") {
    return null
  }

  if (placement === "mobile") {
    return (
      <SheetClose asChild>
        <Link
          href="/listings/new"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "h-11 w-full rounded-full",
          )}
        >
          <Plus aria-hidden="true" className="size-4" />
          Anunciar produto
        </Link>
      </SheetClose>
    )
  }

  return (
    <Button asChild className="hidden h-11 rounded-full px-4 sm:inline-flex">
      <Link href="/listings/new">
        <Plus aria-hidden="true" className="size-4" />
        Anunciar produto
      </Link>
    </Button>
  )
}
