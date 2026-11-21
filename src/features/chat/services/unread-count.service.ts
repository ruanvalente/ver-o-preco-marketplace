import { CHAT_CONVERSATION_PAGE_SIZE } from "../constants";

export type UnreadCountValue = number | string | null | undefined;

/**
 * Regra de domínio: uma conversa tem mensagens não lidas quando a contagem é
 * maior que zero. Tanto a linha da RPC (`unread_count`) quanto o
 * `ChatConversation` mapeado (`unreadCount`) alimentam esta função.
 */
export function conversationHasUnreadMessages(
  unreadCount: UnreadCountValue,
): boolean {
  return Number(unreadCount ?? 0) > 0;
}

type UnreadPage<T> = {
  ok: boolean;
  rows: T[];
};

/**
 * Percorre todas as páginas de conversas aplicando a regra compartilhada, para
 * que os chamadores não discordem sobre o que significa "não lida" nem deixem
 * de contar conversas além da primeira página. Retorna `null` se alguma
 * página falhar.
 *
 * Invariante: `CHAT_CONVERSATION_PAGE_SIZE` precisa ser menor ou igual ao
 * clamp de `p_limit` na RPC `get_chat_conversations` (atualmente 100). Se o
 * constant ultrapassar esse limite, cada página virá com menos linhas que o
 * solicitado e o critério de término encerraria a contagem antes do fim.
 */
export async function countUnreadConversationsPaginated<T>(
  fetchPage: (limit: number, offset: number) => Promise<UnreadPage<T>>,
  getUnreadCount: (row: T) => UnreadCountValue,
): Promise<number | null> {
  let unreadCount = 0;
  let offset = 0;

  while (true) {
    const page = await fetchPage(CHAT_CONVERSATION_PAGE_SIZE, offset);

    if (!page.ok) {
      return null;
    }

    unreadCount += page.rows.filter((row) =>
      conversationHasUnreadMessages(getUnreadCount(row)),
    ).length;

    if (page.rows.length < CHAT_CONVERSATION_PAGE_SIZE) {
      return unreadCount;
    }

    offset += page.rows.length;
  }
}
