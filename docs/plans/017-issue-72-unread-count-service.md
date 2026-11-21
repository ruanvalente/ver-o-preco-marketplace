## 1. Objetivo

Centralizar a regra de "conversa com mensagens não lidas" e a busca paginada no módulo Chat, eliminando as quatro implementações divergentes nos componentes de shell. A issue-pai é #70, Fase 01 — Foundation & correctness.

## 2. Estado atual (diagnóstico)

- `header-auth.tsx`: lia apenas 100 linhas com `getChatConversations(100)` e contava `unreadCount > 0`; acima de 100 conversas o contador divergia dos demais.
- `marketplace-account-area.tsx` e `marketplace-mobile-account.tsx`: cada um com seu próprio *loop* paginado em 100 linhas e a mesma regra `unreadCount > 0`.
- `chat-header-notifications.tsx`: chamava a RPC `get_chat_conversations` diretamente no cliente com paginação própria e aplicava a regra sobre `unread_count`.
- `docs/architecture/modules.md` já declara "Unread count" como responsabilidade do módulo Chat.

## 3. Escopo aprovado

### Chat (dono da regra)

- `src/features/chat/services/unread-count.service.ts` (novo): `conversationHasUnreadMessages()` (regra `> 0`, aceita `number | string | null | undefined`) e `countUnreadConversationsPaginated()` (percorre todas as páginas com `CHAT_CONVERSATION_PAGE_SIZE`, retorna `null` em erro). Sem import de Supabase — utilizável em server e client.
- `src/features/chat/services/chat.service.ts`: novo `getUnreadChatConversationCount()`, que adapta `getChatConversations(limit, offset)` ao helper compartilhado.
- `src/features/chat/services/chat-client.service.ts` (novo): `"use client"`, `getUnreadConversationCount()` com `createClient()` do browser e a RPC, adaptada ao mesmo helper.

### Consumidores

- `header-auth.tsx`, `marketplace-account-area.tsx`, `marketplace-mobile-account.tsx`: remover os helpers locais e consumir `getUnreadChatConversationCount()`. O header preserva o fallback `0` em erro (`?? 0`); os demais preservam `null`.
- `chat-header-notifications.tsx`: remover o helper/RPC local e chamar `getUnreadConversationCount()`. Props públicas, `aria-label`, debounce de 50 ms e Realtime inalterados.

## 4. Não-objetivos

- Mudança de contratos públicos, copy da UI ou aparência dos badges.
- Mudança de schema, RPC, RLS ou migration.
- Refatoração da duplicação de payload de imagens apontada na #71 (fora deste escopo).
- Commit, push, PR ou fechamento de issue sem revisão.

## 5. Critérios de aceite (BDD)

- **Dado** um usuário com mais de 100 conversas, **quando** o header, o menu de conta e o badge são renderizados, **então** os três exibem a mesma contagem de conversas não lidas.
- **Dado** uma falha na RPC, **quando** a contagem é carregada, **então** o header exibe `0` e os demais componentes exibem "contagem indisponível".
- **Dado** uma mensagem recebida em Realtime, **quando** o canal dispara, **então** o badge reconcilia a contagem com o mesmo debounce e limites anteriores.
- **Dado** os testes existentes de header/chat, **quando** a suíte roda, **então** todos passam.

## 6. Estratégia de testes (TDD)

- `unread-count.service.test.ts` — regra de domínio, paginação além de 100 conversas e retorno `null` em erro.
- `chat-service.test.ts` — wrapper server conta todas as páginas e retorna `null` falhando a RPC.
- `chat-client.service.test.ts` — wrapper client usa `unread_count` da RPC e retorna `null` em payload inválido.
- Componentes de shell — mocks passam a isolar o serviço do Chat; títulos de teste em inglês conforme convenção do repositório.

## 7. Skills e MCPs utilizados

- `tdd` — ciclo vermelho → verde por slice (utilitário → wrapper server → wrapper client → quatro call sites).
- Context7 / documentação local do Next.js — não necessários nesta mudança (sem nova API de framework; fronteiras Server/Client já conhecidas e validadas pela build).
- MCP do Supabase — não utilizado (nenhuma mudança de schema, RLS ou dado).

## 8. Validação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, mais revisão com os agentes `architect` e `reviewer`.
