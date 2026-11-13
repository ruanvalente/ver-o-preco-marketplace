import { beforeEach, describe, expect, it, vi } from "vitest"

import { generateMetadata } from "@/app/(public)/products/[id]/page"
import { getProductById } from "../services/products.service"
import { productDetailFixture } from "./fixtures"

vi.mock("../services/products.service", () => ({
  getProductById: vi.fn(),
  getRelatedProducts: vi.fn(),
}))

vi.mock("@/features/auth/services/session.service", () => ({
  getCurrentUser: vi.fn(),
}))

const mockedGetProductById = vi.mocked(getProductById)

const params = Promise.resolve({ id: productDetailFixture.id })

describe("ProductDetailPage metadata", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("gera título e descrição a partir do anúncio ativo", async () => {
    mockedGetProductById.mockResolvedValue({
      ok: true,
      data: productDetailFixture,
    })

    const metadata = await generateMetadata({ params })

    expect(metadata.title).toBe(
      "iPhone 15 Pro 256GB Titânio Natural — Ver-o-Preço",
    )
    expect(metadata.description).toBe(
      "iPhone 15 Pro 256GB Titânio Natural por R$ 4.500 em Belém - Nazaré. Negocie pelo chat do Ver-o-Preço.",
    )
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        title: "iPhone 15 Pro 256GB Titânio Natural — Ver-o-Preço",
        locale: "pt_BR",
        siteName: "Ver-o-Preço",
        type: "website",
      }),
    )
  })

  it("usa um título de não encontrado para anúncios inexistentes ou inativos", async () => {
    mockedGetProductById.mockResolvedValue({ ok: true, data: null })

    await expect(generateMetadata({ params })).resolves.toEqual({
      title: "Anúncio não encontrado — Ver-o-Preço",
    })
  })

  it("usa um título seguro quando a consulta falha", async () => {
    mockedGetProductById.mockResolvedValue({
      ok: false,
      error: "Não foi possível carregar este anúncio.",
    })

    await expect(generateMetadata({ params })).resolves.toEqual({
      title: "Anúncio indisponível — Ver-o-Preço",
    })
  })
})
