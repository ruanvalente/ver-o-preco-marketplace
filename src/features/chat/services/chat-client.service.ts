"use client";

import { createClient } from "@/lib/supabase/client";

import { countUnreadConversationsPaginated } from "./unread-count.service";

type ConversationRow = {
  unread_count?: number | string | null;
};

/**
 * Client-side unread conversation count used by the header notification
 * widget. Keeps the paginated RPC fetch and the domain rule in the chat
 * module; the widget owns only Realtime state.
 */
export async function getUnreadConversationCount(): Promise<number | null> {
  const supabase = createClient();

  return countUnreadConversationsPaginated<ConversationRow>(
    async (limit, offset) => {
      const { data, error } = await supabase.rpc("get_chat_conversations", {
        p_limit: limit,
        p_offset: offset,
      });

      if (error || !Array.isArray(data)) {
        console.error("[chat] getUnreadConversationCount", error ?? data);
        return { ok: false, rows: [] };
      }

      return { ok: true, rows: data as ConversationRow[] };
    },
    (row) => row.unread_count,
  );
}
