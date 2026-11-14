import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { FavoritesPage } from "../components/favorites-page";
import { productSummaryFixture } from "@/features/products/tests/fixtures";

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return { ...actual, useRouter: () => ({ push: vi.fn() }) };
});

vi.mock("../services/favorites.actions", () => ({
  setFavoriteAction: vi.fn(async () => ({ ok: true })),
}));

describe("FavoritesPage", () => {
  it("reuses the cards, indicating that the products are already saved", () => {
    render(
      <FavoritesPage
        result={{
          ok: true,
          data: { products: [productSummaryFixture], unavailableCount: 0 },
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Meus favoritos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `Remover ${productSummaryFixture.title} dos favoritos`,
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("provides guidance on exploring products when the collection is empty", () => {
    render(
      <FavoritesPage
        result={{ ok: true, data: { products: [], unavailableCount: 0 } }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Você ainda não adicionou favoritos",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explorar produtos" }),
    ).toHaveAttribute("href", "/products");
  });

  it("explains when the remaining favorites are unavailable", () => {
    render(
      <FavoritesPage
        result={{ ok: true, data: { products: [], unavailableCount: 1 } }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Nenhum anúncio salvo está disponível",
      }),
    ).toBeInTheDocument();
  });

  it("presents a recoverable error when the collection fails to load", () => {
    render(
      <FavoritesPage
        result={{ ok: false, error: "Tente novamente mais tarde." }}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tente novamente mais tarde.",
    );
    expect(
      screen.getByRole("link", { name: "Tentar novamente" }),
    ).toHaveAttribute("href", "/favorites");
  });
});
