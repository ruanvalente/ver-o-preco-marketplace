import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateAvatarClient } from "../services/profile-storage.service";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  updateAvatarAction: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: mocks.createClient,
}));

vi.mock("../services/profile.actions", () => ({
  updateAvatarAction: mocks.updateAvatarAction,
}));

const getUserMock = vi.fn();
const uploadMock = vi.fn();
const listMock = vi.fn();
const removeMock = vi.fn();
const getPublicUrlMock = vi.fn();

const storageClient = {
  upload: uploadMock,
  list: listMock,
  remove: removeMock,
  getPublicUrl: getPublicUrlMock,
};

const fakeClient = {
  auth: { getUser: getUserMock },
  storage: { from: vi.fn(() => storageClient) },
};

const userId = "22222222-2222-4222-8222-222222222222";
const avatarPath = `${userId}/avatar.png`;
const publicUrl = `https://cdn.example.com/${avatarPath}`;

function createAvatarFile() {
  return new File(["avatar"], "avatar.png", { type: "image/png" });
}

describe("updateAvatarClient", () => {
  const callOrder: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    callOrder.length = 0;
    mocks.createClient.mockReturnValue(fakeClient);
    getUserMock.mockResolvedValue({ data: { user: { id: userId } }, error: null });
    uploadMock.mockImplementation(async () => {
      callOrder.push("upload");
      return { data: { path: avatarPath }, error: null };
    });
    listMock.mockResolvedValue({ data: [{ name: "avatar.jpg" }], error: null });
    removeMock.mockImplementation(async () => {
      callOrder.push("cleanup");
      return { error: null };
    });
    getPublicUrlMock.mockImplementation(() => {
      callOrder.push("url");
      return { data: { publicUrl } };
    });
    mocks.updateAvatarAction.mockImplementation(async () => {
      callOrder.push("action");
      return { success: true };
    });
  });

  it("uploads, persists, cleans up and returns the public URL in order", async () => {
    const result = await updateAvatarClient(createAvatarFile(), userId);

    expect(result).toEqual({
      success: true,
      avatarPath,
      avatarUrl: publicUrl,
    });
    expect(mocks.updateAvatarAction).toHaveBeenCalledWith(avatarPath);
    expect(removeMock).toHaveBeenCalledWith([`${userId}/avatar.jpg`]);
    expect(callOrder).toEqual(["upload", "action", "cleanup", "url"]);
  });

  it("stops before the action when the upload is rejected", async () => {
    const invalidFile = new File(["avatar"], "avatar.gif", { type: "image/gif" });

    const result = await updateAvatarClient(invalidFile, userId);

    expect(result).toEqual({
      success: false,
      error: "Formato de imagem não suportado. Use JPG, PNG ou WebP.",
    });
    expect(mocks.updateAvatarAction).not.toHaveBeenCalled();
    expect(removeMock).not.toHaveBeenCalled();
    expect(getPublicUrlMock).not.toHaveBeenCalled();
    expect(callOrder).toEqual([]);
  });

  it("does not clean up or build a URL when persisting the avatar fails", async () => {
    mocks.updateAvatarAction.mockImplementation(async () => {
      callOrder.push("action");
      return { success: false, error: "Não foi possível atualizar o avatar." };
    });

    const result = await updateAvatarClient(createAvatarFile(), userId);

    expect(result).toEqual({
      success: false,
      error: "Não foi possível atualizar o avatar.",
    });
    expect(removeMock).not.toHaveBeenCalled();
    expect(getPublicUrlMock).not.toHaveBeenCalled();
    expect(callOrder).toEqual(["upload", "action"]);
  });

  it("keeps the avatar when only the obsolete-file cleanup fails", async () => {
    removeMock.mockImplementation(async () => {
      callOrder.push("cleanup");
      return { error: { message: "boom" } };
    });

    const result = await updateAvatarClient(createAvatarFile(), userId);

    expect(result).toEqual({
      success: true,
      avatarPath,
      avatarUrl: publicUrl,
      cleanupError:
        "O avatar foi atualizado, mas não foi possível remover arquivos antigos.",
    });
    expect(mocks.updateAvatarAction).toHaveBeenCalledWith(avatarPath);
    expect(callOrder).toEqual(["upload", "action", "cleanup", "url"]);
  });

  it("returns a human-readable error when an unexpected failure occurs", async () => {
    getPublicUrlMock.mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    const result = await updateAvatarClient(createAvatarFile(), userId);

    expect(result).toEqual({
      success: false,
      error: "Erro ao fazer upload da imagem.",
    });
  });
});
