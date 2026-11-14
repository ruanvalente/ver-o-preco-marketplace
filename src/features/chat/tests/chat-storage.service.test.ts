import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteChatImage,
  getChatImageUrl,
} from "../services/chat-storage.service";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: mocks.createClient,
}));

const rpcMock = vi.fn();
const createSignedUrlMock = vi.fn();
const removeMock = vi.fn();

const fakeClient = {
  rpc: rpcMock,
  storage: {
    from: vi.fn(() => ({
      createSignedUrl: createSignedUrlMock,
      remove: removeMock,
    })),
  },
};

const conversationId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const storagePath = `${conversationId}/${userId}/33333333-3333-4333-8333-333333333333.jpg`;

describe("chat storage authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockReturnValue(fakeClient);
    rpcMock.mockResolvedValue({ data: true, error: null });
    createSignedUrlMock.mockResolvedValue({
      data: { signedUrl: "https://signed" },
      error: null,
    });
    removeMock.mockResolvedValue({ error: null });
  });

  describe("getChatImageUrl", () => {
    it("signs the image when the caller participates in the conversation", async () => {
      const result = await getChatImageUrl(storagePath);

      expect(result).toEqual({ ok: true, data: "https://signed" });
      expect(rpcMock).toHaveBeenCalledWith("is_conversation_participant", {
        p_conversation_id: conversationId,
      });
      expect(createSignedUrlMock).toHaveBeenCalledWith(
        storagePath,
        expect.any(Number),
      );
    });

    it("refuses to sign when the caller is not a participant", async () => {
      rpcMock.mockResolvedValue({ data: false, error: null });

      const result = await getChatImageUrl(storagePath);

      expect(result).toEqual({
        ok: false,
        error: "Esta imagem não está disponível.",
      });
      expect(createSignedUrlMock).not.toHaveBeenCalled();
    });

    it("fails closed when the participation check errors", async () => {
      rpcMock.mockResolvedValue({
        data: null,
        error: { message: "permission denied" },
      });

      const result = await getChatImageUrl(storagePath);

      expect(result).toMatchObject({ ok: false });
      expect(createSignedUrlMock).not.toHaveBeenCalled();
    });

    it("fails closed on malformed storage paths without calling the database", async () => {
      const result = await getChatImageUrl("../etc/passwd");

      expect(result).toEqual({
        ok: false,
        error: "Esta imagem não está disponível.",
      });
      expect(rpcMock).not.toHaveBeenCalled();
      expect(createSignedUrlMock).not.toHaveBeenCalled();
    });

    it("returns an error when signing fails", async () => {
      createSignedUrlMock.mockResolvedValue({
        data: null,
        error: { message: "boom" },
      });

      const result = await getChatImageUrl(storagePath);

      expect(result).toMatchObject({ ok: false });
    });
  });

  describe("deleteChatImage", () => {
    it("removes the image when the caller participates in the conversation", async () => {
      const result = await deleteChatImage(storagePath);

      expect(result).toEqual({ ok: true, data: null });
      expect(rpcMock).toHaveBeenCalledWith("is_conversation_participant", {
        p_conversation_id: conversationId,
      });
      expect(removeMock).toHaveBeenCalledWith([storagePath]);
    });

    it("refuses to remove when the caller is not a participant", async () => {
      rpcMock.mockResolvedValue({ data: false, error: null });

      const result = await deleteChatImage(storagePath);

      expect(result).toEqual({
        ok: false,
        error: "Não foi possível remover a imagem enviada.",
      });
      expect(removeMock).not.toHaveBeenCalled();
    });

    it("fails closed on malformed storage paths without calling the database", async () => {
      const result = await deleteChatImage(`${conversationId}/${userId}`);

      expect(result).toMatchObject({ ok: false });
      expect(rpcMock).not.toHaveBeenCalled();
      expect(removeMock).not.toHaveBeenCalled();
    });
  });
});
