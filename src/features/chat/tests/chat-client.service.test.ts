import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ rpc: mocks.rpc }),
}));

import { CHAT_CONVERSATION_PAGE_SIZE } from "../constants";
import { getUnreadConversationCount } from "../services/chat-client.service";

describe("getUnreadConversationCount", () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
  });

  it("counts unread conversations across all pages using the RPC rows", async () => {
    const fullPage = () =>
      Array.from({ length: CHAT_CONVERSATION_PAGE_SIZE }, () => ({
        unread_count: "1",
      }));
    mocks.rpc
      .mockResolvedValueOnce({ data: fullPage(), error: null })
      .mockResolvedValueOnce({ data: fullPage(), error: null })
      .mockResolvedValueOnce({
        data: [{ unread_count: "0" }],
        error: null,
      });

    const result = await getUnreadConversationCount();

    expect(result).toBe(2 * CHAT_CONVERSATION_PAGE_SIZE);
    expect(mocks.rpc).toHaveBeenCalledTimes(3);
    expect(mocks.rpc).toHaveBeenCalledWith("get_chat_conversations", {
      p_limit: CHAT_CONVERSATION_PAGE_SIZE,
      p_offset: CHAT_CONVERSATION_PAGE_SIZE,
    });
  });

  it("returns null when the RPC fails or returns an unexpected payload", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: new Error("down") });
    expect(await getUnreadConversationCount()).toBeNull();

    mocks.rpc.mockResolvedValueOnce({
      data: { unexpected: true },
      error: null,
    });
    expect(await getUnreadConversationCount()).toBeNull();
  });
});
