import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const route = vi.hoisted(() => ({ pathname: "/dashboard" }))

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}))

import { MarketplaceCreateListingAction } from "./marketplace-create-listing-action"
import { Sheet } from "@/components/ui/sheet"

describe("MarketplaceCreateListingAction", () => {
  it("hides the create-listing action on the seller dashboard", () => {
    route.pathname = "/dashboard"

    render(<MarketplaceCreateListingAction placement="header" />)

    expect(
      screen.queryByRole("link", { name: "Anunciar produto" }),
    ).not.toBeInTheDocument()
  })

  it("keeps the action on other routes in both header and mobile navigation", () => {
    route.pathname = "/products"

    const { rerender } = render(
      <MarketplaceCreateListingAction placement="header" />,
    )

    expect(
      screen.getByRole("link", { name: "Anunciar produto" }),
    ).toHaveAttribute("href", "/listings/new")

    rerender(
      <Sheet>
        <MarketplaceCreateListingAction placement="mobile" />
      </Sheet>,
    )

    expect(
      screen.getByRole("link", { name: "Anunciar produto" }),
    ).toHaveAttribute("href", "/listings/new")

  })

  it("hides the mobile action on the seller dashboard", () => {
    route.pathname = "/dashboard"

    render(
      <Sheet>
        <MarketplaceCreateListingAction placement="mobile" />
      </Sheet>,
    )

    expect(
      screen.queryByRole("link", { name: "Anunciar produto" }),
    ).not.toBeInTheDocument()
  })
})
