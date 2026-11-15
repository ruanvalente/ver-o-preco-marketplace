import { describe, expect, it } from "vitest";

import { isAvatarPathForUser } from "./profile.schemas";

describe("isAvatarPathForUser", () => {
  it("accepts an avatar path owned by the authenticated user", () => {
    expect(isAvatarPathForUser("user-1/avatar.webp", "user-1")).toBe(true);
  });

  it("rejects another user's avatar and paths outside the avatar filename pattern", () => {
    expect(isAvatarPathForUser("user-2/avatar.webp", "user-1")).toBe(false);
    expect(isAvatarPathForUser("user-1/nested/avatar.webp", "user-1")).toBe(false);
    expect(isAvatarPathForUser("user-1/avatar.svg", "user-1")).toBe(false);
    expect(isAvatarPathForUser(null, "user-1")).toBe(false);
  });
});
