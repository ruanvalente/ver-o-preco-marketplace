import { describe, expect, it } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"

import { ContactSellerCta } from "../components/detail/contact-seller-cta"
import { ProductDetailView } from "../components/detail/product-detail-view"
import {
  productDetailFixture,
  productSummaryFixture,
} from "./fixtures"

describe("ProductDetailView", () => {
  it("apresenta galeria, informações, vendedor e anúncios relacionados", () => {
    render(
      <ProductDetailView
        product={productDetailFixture}
        relatedProducts={[productSummaryFixture]}
        isAuthenticated={false}
      />,
    )

    const heading = screen.getByRole("heading", {
      level: 1,
      name: productDetailFixture.title,
    })
    const detailColumn = heading.closest("div")

    expect(heading).toBeInTheDocument()
    expect(detailColumn).not.toBeNull()

    const detail = within(detailColumn as HTMLElement)

    expect(detail.getByText("R$ 4.500")).toBeInTheDocument()
    expect(detail.getByText("Seminovo")).toBeInTheDocument()
    expect(detail.getByText("Belém - Nazaré")).toBeInTheDocument()
    expect(detail.getByText("Há 2 dias")).toBeInTheDocument()
    expect(
      detail.getByRole("heading", { level: 2, name: "Descrição" }),
    ).toBeInTheDocument()
    expect(
      detail.getByText(productDetailFixture.description),
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", { name: "Informações do vendedor" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Ana Souza" }),
    ).toHaveAttribute("href", `/profile/${productDetailFixture.seller.id}`)

    expect(
      screen.getByRole("heading", { level: 2, name: "Anúncios relacionados" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Ver tudo em Celulares" }),
    ).toHaveAttribute("href", "/products?category=celulares")
  })

  it("troca a imagem principal ao selecionar uma miniatura", () => {
    render(
      <ProductDetailView
        product={productDetailFixture}
        relatedProducts={[]}
        isAuthenticated={false}
      />,
    )

    expect(
      screen.getByRole("img", {
        name: "iPhone 15 Pro na cor titânio natural",
      }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole("button", { name: "Ver imagem 2 de 2" }),
    )

    expect(
      screen.getByRole("img", { name: "Parte traseira do iPhone 15 Pro" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Ver imagem 2 de 2" }),
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("mostra o placeholder quando a imagem principal falha ao carregar", () => {
    render(
      <ProductDetailView
        product={productDetailFixture}
        relatedProducts={[]}
        isAuthenticated={false}
      />,
    )

    fireEvent.error(
      screen.getByRole("img", {
        name: "iPhone 15 Pro na cor titânio natural",
      }),
    )

    expect(
      screen.getByRole("img", {
        name: "iPhone 15 Pro na cor titânio natural indisponível",
      }),
    ).toBeInTheDocument()
    expect(screen.getByText("Sem imagem")).toBeInTheDocument()
  })

  it("mostra uma descrição alternativa quando o anúncio não tem texto", () => {
    render(
      <ProductDetailView
        product={{ ...productDetailFixture, description: "" }}
        relatedProducts={[]}
        isAuthenticated={false}
      />,
    )

    expect(
      screen.getByText(
        "O vendedor não adicionou uma descrição a este anúncio.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { level: 2, name: "Anúncios relacionados" }),
    ).not.toBeInTheDocument()
  })
})

describe("ContactSellerCta", () => {
  it("convida usuários anônimos a entrar preservando o retorno ao anúncio", () => {
    render(
      <ContactSellerCta
        productId="product-1"
        productTitle="iPhone 15 Pro"
        isAuthenticated={false}
      />,
    )

    expect(
      screen.getByRole("link", { name: "Entrar para conversar" }),
    ).toHaveAttribute("href", "/login?next=%2Fproducts%2Fproduct-1")
    expect(
      screen.getByText("Entre na sua conta para conversar com este vendedor."),
    ).toBeInTheDocument()
  })

  it("mostra o chat como indisponível para usuários autenticados", () => {
    render(
      <ContactSellerCta
        productId="product-1"
        productTitle="iPhone 15 Pro"
        isAuthenticated
      />,
    )

    expect(
      screen.getByRole("button", { name: "Conversar com o vendedor" }),
    ).toBeDisabled()
    expect(
      screen.getByText(
        "O chat entre compradores e vendedores está em desenvolvimento.",
      ),
    ).toBeInTheDocument()
  })
})
