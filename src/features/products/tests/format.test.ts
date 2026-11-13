import { describe, expect, it } from "vitest"

import {
  formatCount,
  formatListingCount,
  formatPrice,
  formatRelativeTime,
} from "../utils/format"

describe("formatPrice", () => {
  it("formata valores sem centavos no padrão brasileiro", () => {
    expect(formatPrice(4500)).toBe("R$ 4.500")
    expect(formatPrice(320)).toBe("R$ 320")
  })
})

describe("formatCount", () => {
  it("usa separador de milhar", () => {
    expect(formatCount(1248)).toBe("1.248")
    expect(formatCount(58)).toBe("58")
  })
})

describe("formatListingCount", () => {
  it("pluraliza a contagem de anúncios", () => {
    expect(formatListingCount(1)).toBe("1 anúncio")
    expect(formatListingCount(248)).toBe("248 anúncios")
  })
})

describe("formatRelativeTime", () => {
  const reference = "2026-10-29T12:00:00-03:00"

  it("mostra minutos, horas e dias", () => {
    expect(formatRelativeTime("2026-10-29T11:35:00-03:00", reference)).toBe(
      "Há 25 min",
    )
    expect(formatRelativeTime("2026-10-29T11:00:00-03:00", reference)).toBe(
      "Há 1 hora",
    )
    expect(formatRelativeTime("2026-10-29T09:00:00-03:00", reference)).toBe(
      "Há 3 horas",
    )
    expect(formatRelativeTime("2026-10-27T12:00:00-03:00", reference)).toBe(
      "Há 2 dias",
    )
  })

  it("usa data curta quando o anúncio é antigo", () => {
    expect(formatRelativeTime("2026-10-01T12:00:00-03:00", reference)).toBe(
      "01 de out.",
    )
  })

  it("retorna um rótulo seguro para datas inválidas", () => {
    expect(formatRelativeTime("data-invalida", reference)).toBe(
      "Publicado recentemente",
    )
  })
})
