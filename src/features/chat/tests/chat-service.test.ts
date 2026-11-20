import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_SIGNED_URL_TTL_SECONDS } from "../constants";
import {
  checkConversationParticipation,
  getChatConversations,
  getConversationMessages,
  getSellerChatMetrics,
  sendChatMessage,
} from "../services/chat.service";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

const rpcMock = vi.fn();
const createSignedUrlsMock = vi.fn();

type Chainable = {
  select: () => Chainable;
  eq: () => Chainable;
  or: () => Chainable;
  order: () => Chainable;
  insert: () => Chainable;
  limit: () => Promise<{ data: unknown; error: null }>;
  single: () => Promise<{ data: unknown; error: null }>;
  maybeSingle: () => Promise<{ data: unknown; error: null }>;
};

function createMockClient(rows: unknown[]) {
  const chain: Chainable = {
    select: () => chain,
    eq: () => chain,
    or: () => chain,
    order: () => chain,
    insert: () => chain,
    limit: () => Promise.resolve({ data: rows, error: null }),
    single: () => Promise.resolve({ data: rows[0] ?? null, error: null }),
    maybeSingle: () => Promise.resolve({ data: rows[0] ?? null, error: null }),
  };

  return {
    rpc: rpcMock,
    from: vi.fn(() => chain),
    storage: {
      from: vi.fn(() => ({ createSignedUrls: createSignedUrlsMock })),
    },
  };
}

const conversationId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const attachmentPath = `${conversationId}/${userId}/33333333-3333-4333-8333-333333333333.jpg`;

function messageRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    conversation_id: conversationId,
    sender_id: userId,
    message_type: "image",
    content: null,
    attachment_path: attachmentPath,
    created_at: "2026-11-13T14:00:00.000Z",
    read_at: null,
    ...overrides,
  };
}

function conversationRow(overrides: Record<string, unknown> = {}) {
  return {
    conversation_id: conversationId,
    product_id: "55555555-5555-4555-8555-555555555555",
    product_title: "Açaí",
    product_price: "12.50",
    product_city: "Belém",
    product_neighborhood: "Ver-o-Peso",
    product_image_path: null,
    other_user_id: userId,
    other_display_name: "  Maria  ",
    other_avatar_path: null,
    last_message_id: "66666666-6666-4666-8666-666666666666",
    last_message_type: "image",
    last_message_content: null,
    last_message_sender_id: userId,
    last_message_created_at: "2026-11-13T14:00:00.000Z",
    unread_count: "3",
    updated_at: "2026-11-13T14:01:00.000Z",
    ...overrides,
  };
}

describe("getChatConversations", () => {
  it("maps RPC rows to chat conversations", async () => {
    rpcMock.mockResolvedValue({ data: [conversationRow()], error: null });
    mocks.createClient.mockReturnValue(createMockClient([]));

    const result = await getChatConversations(10, 0);

    expect(result.ok).toBe(true);
    expect(result).toMatchObject({
      ok: true,
      data: [
        {
          id: conversationId,
          participant: { id: userId, displayName: "Maria" },
          product: {
            title: "Açaí",
            price: 12.5,
            location: "Belém - Ver-o-Peso",
            imageUrl: null,
          },
          lastMessage: { type: "image", content: null },
          unreadCount: 3,
        },
      ],
    });
    expect(rpcMock).toHaveBeenCalledWith("get_chat_conversations", {
      p_limit: 10,
      p_offset: 0,
    });
  });

  it("returns an empty list when the RPC payload is not an array", async () => {
    rpcMock.mockResolvedValue({ data: { unexpected: true }, error: null });
    mocks.createClient.mockReturnValue(createMockClient([]));

    const result = await getChatConversations();

    expect(result).toEqual({ ok: true, data: [] });
  });
});

describe("chat service image signing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpcMock.mockResolvedValue({ data: true, error: null });
    createSignedUrlsMock.mockResolvedValue({
      data: [{ path: attachmentPath, signedUrl: "https://signed" }],
      error: null,
    });
  });

  describe("sendChatMessage", () => {
    it("signs the attachment when the caller participates in the conversation", async () => {
      mocks.createClient.mockReturnValue(createMockClient([messageRow()]));

      const result = await sendChatMessage({
        conversationId,
        senderId: userId,
        type: "image",
        content: null,
        attachmentPath,
      });

      expect(result).toMatchObject({
        ok: true,
        data: { imageUrl: "https://signed" },
      });
      expect(rpcMock).toHaveBeenCalledWith("is_conversation_participant", {
        p_conversation_id: conversationId,
      });
      expect(createSignedUrlsMock).toHaveBeenCalledWith(
        [attachmentPath],
        CHAT_SIGNED_URL_TTL_SECONDS,
      );
    });

    it("skips signing when the caller is not a participant", async () => {
      rpcMock.mockResolvedValue({ data: false, error: null });
      mocks.createClient.mockReturnValue(createMockClient([messageRow()]));

      const result = await sendChatMessage({
        conversationId,
        senderId: userId,
        type: "image",
        content: null,
        attachmentPath,
      });

      expect(result).toMatchObject({
        ok: true,
        data: { imageUrl: null },
      });
      expect(createSignedUrlsMock).not.toHaveBeenCalled();
    });

    it("skips signing when the participation check fails", async () => {
      rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });
      mocks.createClient.mockReturnValue(createMockClient([messageRow()]));

      const result = await sendChatMessage({
        conversationId,
        senderId: userId,
        type: "image",
        content: null,
        attachmentPath,
      });

      expect(result).toMatchObject({
        ok: true,
        data: { imageUrl: null },
      });
      expect(createSignedUrlsMock).not.toHaveBeenCalled();
    });

    it("does not check participation for text messages", async () => {
      const row = messageRow({
        message_type: "text",
        content: "Olá!",
        attachment_path: null,
      });
      mocks.createClient.mockReturnValue(createMockClient([row]));

      const result = await sendChatMessage({
        conversationId,
        senderId: userId,
        type: "text",
        content: "Olá!",
        attachmentPath: null,
      });

      expect(result).toMatchObject({ ok: true });
      expect(rpcMock).not.toHaveBeenCalled();
      expect(createSignedUrlsMock).not.toHaveBeenCalled();
    });
  });

  describe("getConversationMessages", () => {
    it("signs every attachment in a message page for participants", async () => {
      const secondPath = `${conversationId}/${userId}/55555555-5555-4555-8555-555555555555.jpg`;
      mocks.createClient.mockReturnValue(
        createMockClient([
          messageRow(),
          messageRow({
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            attachment_path: secondPath,
          }),
        ]),
      );
      createSignedUrlsMock.mockResolvedValue({
        data: [
          { path: attachmentPath, signedUrl: "https://signed" },
          { path: secondPath, signedUrl: "https://signed" },
        ],
        error: null,
      });

      const result = await getConversationMessages(conversationId);

      expect(result).toMatchObject({
        ok: true,
        data: {
          messages: [
            { imageUrl: "https://signed" },
            { imageUrl: "https://signed" },
          ],
        },
      });
      expect(createSignedUrlsMock).toHaveBeenCalledWith(
        expect.arrayContaining([attachmentPath, secondPath]),
        CHAT_SIGNED_URL_TTL_SECONDS,
      );
    });

    it("returns the page without signed urls when participation is denied", async () => {
      rpcMock.mockResolvedValue({ data: false, error: null });
      mocks.createClient.mockReturnValue(createMockClient([messageRow()]));

      const result = await getConversationMessages(conversationId);

      expect(result).toMatchObject({
        ok: true,
        data: { messages: [{ imageUrl: null }] },
      });
      expect(createSignedUrlsMock).not.toHaveBeenCalled();
    });
  });
});

describe("getSellerChatMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the three counters with a single RPC", async () => {
    const client = createMockClient([]);
    mocks.createClient.mockReturnValue(client);
    rpcMock.mockResolvedValue({
      data: [
        {
          conversation_count: 3,
          received_message_count: 7,
          unread_message_count: 2,
        },
      ],
      error: null,
    });

    const result = await getSellerChatMetrics(userId);

    expect(result).toEqual({
      ok: true,
      data: {
        conversationCount: 3,
        receivedMessageCount: 7,
        unreadMessageCount: 2,
      },
    });
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith("get_seller_chat_metrics", {
      p_seller_id: userId,
    });
    expect(client.from).not.toHaveBeenCalled();
  });

  it("coerces bigint counters returned as strings", async () => {
    mocks.createClient.mockReturnValue(createMockClient([]));
    rpcMock.mockResolvedValue({
      data: [
        {
          conversation_count: "4",
          received_message_count: "12",
          unread_message_count: "0",
        },
      ],
      error: null,
    });

    const result = await getSellerChatMetrics(userId);

    expect(result).toMatchObject({
      ok: true,
      data: {
        conversationCount: 4,
        receivedMessageCount: 12,
        unreadMessageCount: 0,
      },
    });
  });

  it("returns zeros when the RPC has no rows", async () => {
    mocks.createClient.mockReturnValue(createMockClient([]));
    rpcMock.mockResolvedValue({ data: [], error: null });

    const result = await getSellerChatMetrics(userId);

    expect(result).toEqual({
      ok: true,
      data: {
        conversationCount: 0,
        receivedMessageCount: 0,
        unreadMessageCount: 0,
      },
    });
  });

  it("returns a human error when the RPC fails", async () => {
    mocks.createClient.mockReturnValue(createMockClient([]));
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });

    const result = await getSellerChatMetrics(userId);

    expect(result).toEqual({
      ok: false,
      error: "Não foi possível carregar suas conversas.",
    });
  });
});

describe("checkConversationParticipation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies an invalid id without querying the database", async () => {
    const result = await checkConversationParticipation("not-a-uuid");

    expect(result).toEqual({ ok: false, reason: "forbidden" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("allows a participant confirmed by the RPC", async () => {
    mocks.createClient.mockReturnValue(createMockClient([]));
    rpcMock.mockResolvedValue({ data: true, error: null });

    const result = await checkConversationParticipation(conversationId);

    expect(result).toEqual({ ok: true });
    expect(rpcMock).toHaveBeenCalledWith("is_conversation_participant", {
      p_conversation_id: conversationId,
    });
  });

  it("denies a non-participant", async () => {
    mocks.createClient.mockReturnValue(createMockClient([]));
    rpcMock.mockResolvedValue({ data: false, error: null });

    const result = await checkConversationParticipation(conversationId);

    expect(result).toEqual({ ok: false, reason: "forbidden" });
  });

  it("fails closed when the RPC is unavailable", async () => {
    mocks.createClient.mockReturnValue(createMockClient([]));
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });

    const result = await checkConversationParticipation(conversationId);

    expect(result).toEqual({ ok: false, reason: "unavailable" });
  });
});
