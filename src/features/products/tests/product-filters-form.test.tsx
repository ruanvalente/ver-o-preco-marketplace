import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ProductFiltersForm } from "../components/catalog/product-filters-form"
import { parseProductFilters } from "../utils/query"
import { categorySummaryFixture } from "./fixtures"

function renderFilters() {
  render(
    <ProductFiltersForm
      filters={parseProductFilters({
        category: "celulares",
        condition: "like_new",
        location: "belem",
      })}
      categories={[categorySummaryFixture]}
    />,
  )
}

describe("ProductFiltersForm", () => {
  it("renders labeled native selects that preserve URL-backed filters", () => {
    renderFilters()

    const category = screen.getByRole("combobox", { name: "Categoria" })
    const condition = screen.getByRole("combobox", { name: "Condição" })
    const location = screen.getByRole("combobox", { name: "Localização" })

    for (const select of [category, condition, location]) {
      expect(select.tagName).toBe("SELECT")
      expect(select).toHaveAttribute("autocomplete", "off")
    }

    expect(category).toHaveValue("celulares")
    expect(condition).toHaveValue("like_new")
    expect(location).toHaveValue("belem")
  })

  it("keeps a visible focus ring on every native select", () => {
    renderFilters()

    for (const name of ["Categoria", "Condição", "Localização"]) {
      const select = screen.getByRole("combobox", { name })

      expect(select).toHaveClass(
        "focus-visible:border-ring",
        "focus-visible:ring-[3px]",
        "focus-visible:ring-ring/50",
      )
    }
  })

  it("keeps the GET form that writes filters into the URL", () => {
    renderFilters()

    const form = screen
      .getByRole("combobox", { name: "Categoria" })
      .closest("form")

    expect(form).toHaveAttribute("action", "/products")
    expect(form).toHaveAttribute("method", "get")
  })
})
