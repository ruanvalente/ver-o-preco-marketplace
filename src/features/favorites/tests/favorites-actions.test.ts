import { beforeEach, describe, expect, it, vi } from "vitest";

import { setFavoriteAction } from "../services/favorites.actions";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  saveFavorite: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/features/auth/services/session.service", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("../services/favorites.service", () => ({
  saveFavorite: mocks.saveFavorite,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

const productId = "3d6f0a3e-25d5-4db4-b9f0-9c2cda5d9921";

describe("setFavoriteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue({ id: "authenticated-user" });
    mocks.saveFavorite.mockResolvedValue({ ok: true, data: null });
  });

  it("uses the session identity and invalidates the list after saving", async () => {
    await expect(setFavoriteAction(productId, true)).resolves.toEqual({
      ok: true,
    });

    expect(mocks.saveFavorite).toHaveBeenCalledWith(
      "authenticated-user",
      productId,
      true,
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/favorites");
  });

  it("requires a session before modifying the collection", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    await expect(setFavoriteAction(productId, true)).resolves.toEqual({
      ok: false,
      reason: "unauthenticated",
    });
    expect(mocks.saveFavorite).not.toHaveBeenCalled();
  });

  it("rejects invalid references without consulting the session", async () => {
    await expect(setFavoriteAction("invalid-id", true)).resolves.toMatchObject({
      ok: false,
      reason: "error",
    });
    expect(mocks.getCurrentUser).not.toHaveBeenCalled();
  });
});
