## 1. Objetivo

Extrair a orquestração de mensagens e scroll de `ChatWindow` para dois hooks testáveis, sem alterar comportamento, props, markup, copy ou integração com Realtime. Issue-pai #70, Fase 03 — Chat & notifications.

## 2. Estado atual (diagnóstico)

`src/features/chat/components/chat-window.tsx` concentra ~150 linhas de estado e efeitos:

- `addMessage` (54-82): merge por `id`, preservação de `imageUrl`, ordenação por `createdAt`/`id` e anúncio `aria-live` para mensagens recebidas.
- recibo de leitura (108-141): `unreadIncoming`, `readAttemptRef`, `markChatMessagesReadAction` e os estados `readError`/`isMarkingRead`.
- histórico (143-187): `loadOlderChatMessagesAction`, dedupe ao prepend, `hasMore` e captura/restauração de scroll.
- scroll (47-51, 90-106, 150-157): três refs, efeito de abertura, autoscroll e preservação de posição.

`useChatRealtime` já é separado e não faz parte deste escopo (ver #78).

## 3. Escopo aprovado

### Chat (dono da lógica)

- `src/features/chat/hooks/use-chat-scroll.ts` (novo): `scrollContainerRef`, `bottomRef`, `captureBeforeLoad()` e `preserveAfterLoad()`. Mantém as dependências originais dos efeitos (`[messages]`), não trocando por contagem.
- `src/features/chat/hooks/use-chat-messages.ts` (novo): estado de mensagens, `addMessage`, `markMessagesRead` e `loadOlderMessages`. `loadOlderMessages` recebe os dois callbacks de preservação de scroll como parâmetro para manter os hooks independentes e a ordem de captura/restauração idêntica à atual.

### Consumidor

- `ChatWindow` chama os dois hooks e faz apenas a fiação: `addMessage` → Realtime + `MessageComposer`, callbacks de scroll → `loadOlderMessages` (usado por `MessageList` e pelo botão de retry), estados → JSX existente. A fronteira `"use client"` continua no `chat-window.tsx`; os hooks seguem a convenção já existente em `use-chat-realtime.ts` de também declararem a diretiva.

## 4. Não-objetivos

- Mudança de props públicas, copy pt-BR, classes, `aria-*`, markup ou comportamento de Realtime.
- Mudança de Server Actions, schemas, tipos, RLS, Storage ou migration.
- Extração de Supabase do composer/hook de Realtime (#78) e renomes cosméticos.
- Commit, push, PR ou fechamento de issue sem revisão e aprovação.

## 5. Critérios de aceite (BDD)

- **Dado** um usuário em uma conversa, **quando** uma mensagem chega pelo Realtime ou pelo composer, **então** ela é mesclada/ordenada e anunciada exatamente como antes.
- **Dado** uma mensagem recebida ainda não lida, **quando** a conversa renderiza, **então** o recibo de leitura é enviado uma vez por mensagem, com o mesmo tratamento de erro.
- **Dado** o carregamento de mensagens mais antigas, **quando** a página volta, **então** a posição de scroll é preservada e novas mensagens ainda rolam para o fim.
- **Dado** os testes existentes de chat, **quando** a suíte roda, **então** todos passam sem alteração.

## 6. Seams de teste (TDD)

Seams confirmados com o usuário antes de escrever os testes:

1. `useChatScroll` via `renderHook` com refs em nós DOM (`use-chat-scroll.test.tsx`): scroll inicial, autoscroll ao crescer a lista e preservação após página antiga. Não cobre layout real do browser.
2. `useChatMessages` via `renderHook` com Server Actions mockadas: dedupe/merge/ordenação, anúncio, recibo de leitura, paginação e erros. Não cobre Realtime/backend — já cobertos por `use-chat-realtime.test.ts` e `chat-actions.test.ts`.
3. `ChatWindow`: teste leve de composição garantindo props, `aria-label`, retry e fiação dos callbacks. Não cobre os efeitos de scroll (seam 1).

Ciclo vermelho → verde em três fatias: scroll → mensagens → composição.

## 7. Skills e MCPs utilizados

- `tdd` — seams acordados e ciclo por fatia.
- Documentação local do Next.js 16.4.6 (`use-client.md` e `server-and-client-components.md`) — confirmou que hooks em módulos separados não precisam de nova diretiva e que a fronteira client permanece no entry point.
- Context7 — não necessário: a regra do repositório aponta a documentação local versionada como fonte para Next.js.
- MCP do Supabase — não utilizado: nenhuma mudança de schema, RLS, dado ou config.

## 8. Validação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, mais revisão com os agentes `architect` e `reviewer`.
