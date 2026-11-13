import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"

import Home from "@/app/(public)/(home)/page"

describe("Home", () => {
  it("renderiza a home do marketplace com um único título principal", () => {
    render(<Home />)

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Encontre o que você precisa/i,
      }),
    ).toBeInTheDocument()
  })
})
