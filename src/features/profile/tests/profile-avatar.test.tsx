import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateAvatarClient: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("../services/profile-storage.service", () => ({
  updateAvatarClient: mocks.updateAvatarClient,
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <div role="img" aria-label={alt} data-src={src} />
  ),
  AvatarFallback: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
}));

import { ProfileAvatar } from "../components/profile-avatar";

const userId = "22222222-2222-4222-8222-222222222222";
const avatarPath = `${userId}/avatar.png`;
const avatarUrl = "https://cdn.example.com/avatar.png";
const previousAvatarUrl = "https://cdn.example.com/previous.png";

function renderAvatar() {
  const onAvatarUpdate = vi.fn();
  const view = render(
    <ProfileAvatar
      userId={userId}
      displayName="Ana"
      avatarUrl={previousAvatarUrl}
      onAvatarUpdate={onAvatarUpdate}
    />,
  );
  const input = view.container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  const file = new File(["avatar"], "avatar.png", { type: "image/png" });

  return {
    ...view,
    onAvatarUpdate,
    input,
    selectFile: () => fireEvent.change(input, { target: { files: [file] } }),
  };
}

describe("ProfileAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies the avatar, notifies the parent and shows success feedback", async () => {
    mocks.updateAvatarClient.mockResolvedValue({
      success: true,
      avatarPath,
      avatarUrl,
    });
    const harness = renderAvatar();

    harness.selectFile();

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        "Avatar atualizado com sucesso!",
      );
    });
    expect(mocks.updateAvatarClient).toHaveBeenCalledWith(
      expect.any(File),
      userId,
    );
    expect(harness.onAvatarUpdate).toHaveBeenCalledWith(avatarPath);
    expect(screen.getByRole("img", { name: "Ana" })).toHaveAttribute(
      "data-src",
      avatarUrl,
    );
    expect(harness.input.value).toBe("");
  });

  it("still applies the avatar when only the cleanup failed", async () => {
    mocks.updateAvatarClient.mockResolvedValue({
      success: true,
      avatarPath,
      avatarUrl,
      cleanupError:
        "O avatar foi atualizado, mas arquivos antigos permaneceram.",
    });
    const harness = renderAvatar();

    harness.selectFile();

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "O avatar foi atualizado, mas arquivos antigos permaneceram.",
      );
    });
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(harness.onAvatarUpdate).toHaveBeenCalledWith(avatarPath);
    expect(screen.getByRole("img", { name: "Ana" })).toHaveAttribute(
      "data-src",
      avatarUrl,
    );
  });

  it("keeps the previous avatar and reports the upload error", async () => {
    mocks.updateAvatarClient.mockResolvedValue({
      success: false,
      error: "Não foi possível fazer upload da imagem.",
    });
    const harness = renderAvatar();

    harness.selectFile();

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Não foi possível fazer upload da imagem.",
      );
    });
    expect(harness.onAvatarUpdate).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: "Ana" })).toHaveAttribute(
      "data-src",
      previousAvatarUrl,
    );
  });

  it("reports a human-readable error when the service throws", async () => {
    mocks.updateAvatarClient.mockRejectedValue(new Error("storage down"));
    const harness = renderAvatar();

    harness.selectFile();

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Erro ao fazer upload da imagem.",
      );
    });
    expect(harness.onAvatarUpdate).not.toHaveBeenCalled();
  });

  it("disables the upload button until the update finishes", async () => {
    let resolveUpdate: (value: unknown) => void = () => {};
    mocks.updateAvatarClient.mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
    );
    const harness = renderAvatar();
    const button = screen.getByRole("button");

    harness.selectFile();

    await waitFor(() => expect(button).toBeDisabled());
    await act(async () => {
      resolveUpdate({ success: true, avatarPath, avatarUrl });
    });
    await waitFor(() => expect(button).toBeEnabled());
  });
});
