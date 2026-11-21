import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MobileProductFilters } from "../components/catalog/mobile-product-filters"

describe("MobileProductFilters accessibility", () => {
  it("keeps keyboard focus inside the modal drawer and restores it on Escape", async () => {
    render(
      <MobileProductFilters activeCount={0}>
        <button type="button">Aplicar filtros</button>
      </MobileProductFilters>,
    )

    const trigger = screen.getByRole("button", { name: "Filtros" })
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = await screen.findByRole("dialog", { name: "Filtros" })
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true)
    })

    const first = screen.getByRole("button", { name: "Aplicar filtros" })
    const last = screen.getByRole("button", { name: "Close" })
    last.focus()
    fireEvent.keyDown(last, { key: "Tab" })

    expect(first).toHaveFocus()

    fireEvent.keyDown(first, { key: "Escape" })

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull()
    })
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })
})
