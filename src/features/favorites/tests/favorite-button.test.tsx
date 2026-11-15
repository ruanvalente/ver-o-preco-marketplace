import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { FavoriteButton } from "../components/favorite-button";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  setFavoriteAction: vi.fn(),
}));

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return { ...actual, useRouter: () => ({ push: mocks.push }) };
});

vi.mock("../services/favorites.actions", () => ({
  setFavoriteAction: mocks.setFavoriteAction,
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setFavoriteAction.mockResolvedValue({ ok: true });
  });

  it("saves the new state and indicates the favorite", async () => {
    render(
      <FavoriteButton
        productId="3d6f0a3e-25d5-4db4-b9f0-9c2cda5d9921"
        productTitle="iPhone 15 Pro"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Adicionar iPhone 15 Pro aos favoritos",
      }),
    );

    await waitFor(() => {
      expect(mocks.setFavoriteAction).toHaveBeenCalledWith(
        "3d6f0a3e-25d5-4db4-b9f0-9c2cda5d9921",
        true,
      );
      expect(
        screen.getByRole("button", {
          name: "Remover iPhone 15 Pro dos favoritos",
        }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("reverts the optimistic state and informs when the save fails", async () => {
    mocks.setFavoriteAction.mockResolvedValue({
      ok: false,
      reason: "error",
      message: "Não foi possível atualizar este favorito.",
    });

    render(
      <FavoriteButton
        productId="3d6f0a3e-25d5-4db4-b9f0-9c2cda5d9921"
        productTitle="iPhone 15 Pro"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Adicionar iPhone 15 Pro aos favoritos",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Adicionar iPhone 15 Pro aos favoritos",
        }),
      ).toHaveAttribute("aria-pressed", "false");
      expect(screen.getByRole("status")).toHaveTextContent(
        "Não foi possível atualizar este favorito.",
      );
    });
  });

  it("redirects to the login page when the session has expired", async () => {
    mocks.setFavoriteAction.mockResolvedValue({
      ok: false,
      reason: "unauthenticated",
    });

    render(
      <FavoriteButton
        productId="3d6f0a3e-25d5-4db4-b9f0-9c2cda5d9921"
        productTitle="iPhone 15 Pro"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Adicionar iPhone 15 Pro aos favoritos",
      }),
    );

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith(
        "/login?next=%2Fproducts%2F3d6f0a3e-25d5-4db4-b9f0-9c2cda5d9921",
      );
    });
  });
});
