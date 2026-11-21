import { describe, expect, it, vi } from "vitest";

import { CHAT_CONVERSATION_PAGE_SIZE } from "../constants";
import {
  conversationHasUnreadMessages,
  countUnreadConversationsPaginated,
} from "../services/unread-count.service";

type FetchPage = (
  limit: number,
  offset: number,
) => Promise<{
  ok: boolean;
  rows: Array<{ unread_count: number }>;
}>;

describe("conversationHasUnreadMessages", () => {
  it("treats a conversation as unread only when the count is greater than zero", () => {
    expect(conversationHasUnreadMessages(1)).toBe(true);
    expect(conversationHasUnreadMessages("2")).toBe(true);
    expect(conversationHasUnreadMessages(0)).toBe(false);
    expect(conversationHasUnreadMessages("0")).toBe(false);
    expect(conversationHasUnreadMessages(null)).toBe(false);
    expect(conversationHasUnreadMessages(undefined)).toBe(false);
  });
});

describe("countUnreadConversationsPaginated", () => {
  it("counts unread conversations across every page beyond one hundred", async () => {
    // 101 conversations across three pages. Only the first row of each page
    // is unread, so the expected count comes from this fixture (3), not from
    // the implementation under test.
    const pageSizes = [
      CHAT_CONVERSATION_PAGE_SIZE,
      CHAT_CONVERSATION_PAGE_SIZE,
      1,
    ];
    let pageIndex = 0;
    const fetchPage = vi.fn<FetchPage>(async () => {
      const size = pageSizes[pageIndex] ?? 0;
      const rows = Array.from({ length: size }, (_, index) => ({
        unread_count: index === 0 ? 1 : 0,
      }));
      pageIndex += 1;
      return { ok: true, rows };
    });

    const result = await countUnreadConversationsPaginated(
      fetchPage,
      (row) => row.unread_count,
    );

    expect(result).toBe(3);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it("returns null when any page fails", async () => {
    const fullPage = Array.from(
      { length: CHAT_CONVERSATION_PAGE_SIZE },
      () => ({ unread_count: 1 }),
    );
    const fetchPage = vi
      .fn<FetchPage>()
      .mockResolvedValueOnce({ ok: true, rows: fullPage })
      .mockResolvedValueOnce({ ok: false, rows: [] });

    const result = await countUnreadConversationsPaginated(
      fetchPage,
      (row) => row.unread_count,
    );

    expect(result).toBeNull();
  });
});
