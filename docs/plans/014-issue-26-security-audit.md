## 1. Objetivo

Concluir os critérios de aceite ainda pendentes da issue #26 (Phase 11 — Segurança): garantir que as Server Actions de chat façam double-check de participação na conversa, e documentar que os demais critérios da issue já foram atendidos por entregas anteriores.

## 2. Estado atual (diagnóstico)

- **URLs assinadas (P0): atendido.** `migrations/0010_chat_signed_url_authorization.sql` cria `public.is_conversation_participant`; `chat-storage.service.ts` e o `addSignedImageUrls` em `chat.service.ts` chamam a RPC antes de assinar, com fail-closed e testes em `chat-storage.service.test.ts` / `chat-service.test.ts`.
- **Políticas de bucket (P0): atendido.** `migrations/0003_products.sql` (`product-images`, leitura pública e escrita restrita à pasta do dono), `0006_profile_avatars.sql` (`avatars`) e `0007_chat.sql` (`chat-images`, bucket privado com SELECT/INSERT/DELETE por participante).
- **Ownership em Server Actions (P0): parcial.** `listing.actions.ts` já usa `requireOwnership`. `favorites.actions.ts` e `profile.actions.ts` derivam o dono da sessão (`user.id`) e validam caminhos; `auth.actions.ts` não opera entidades. As actions de chat usam apenas `requireUser` (autenticação) e dependem da RLS para participação — é a lacuna restante.

## 3. Escopo

- Helper `checkConversationParticipation` em `chat.service.ts`, usando a RPC existente `is_conversation_participant` com resultado discriminado (`forbidden` / `unavailable`).
- Chamada do helper antes de qualquer consulta ou mutação em `sendChatTextAction`, `sendChatImageAction`, `loadOlderChatMessagesAction` e `markChatMessagesReadAction`.
- Mensagens de erro humanas e uniformes, sem expor erro bruto do Supabase nem distinguir "inexistente" de "alheio".
- Testes de actions cobrindo participante, não participante e falha transitória da RPC.
- Atualização de `docs/architecture/supabase.md` e register do diagnóstico neste plano.

## 4. Não-objetivos

- Criar ou executar qualquer migration. A RPC e as policies já estão versionadas; nenhuma escrita será feita no Supabase (MCP permanece somente leitura e não será usado para escrita).
- Alterar RLS, Storage ou comportamento de UI.
- Modificar `auth.actions.ts`, `favorites.actions.ts`, `profile.actions.ts` ou `listing.actions.ts` nesta entrega.
- Commit, push, PR ou fechamento da issue #26 (aguarda aprovação da revisão).

## 5. Decisões

1. **Local da checagem:** nas actions, não dentro dos services de leitura de mensagens. A auditoria aponta explicitamente as actions, e a página `/messages/[conversationId]` já valida a conversa com `getConversation(conversationId, user.id)`; checar no service adicionaria uma RPC a cada carregamento de página.
2. **RPC existente:** reutilizar `is_conversation_participant` (já aplicada no Supabase conforme o usuário). Ela lê `auth.uid()` no servidor e faz fail-closed, então não aceita ID de usuário enviado pelo cliente.
3. **Erros:** espelhar o padrão de `requireOwnership`: `forbidden` e `not found` compartilham a mesma mensagem (evita enumeração); `unavailable` vira mensagem com orientação de retry.
4. **`startConversationAction` permanece como está:** `get_or_create_conversation` deriva comprador e vendedor do JWT e de um anúncio ativo, logo a posse é implícita.
5. **Sem migration nova:** criar uma migration apenas para "reafirmar" policies existentes seria ruído versionado e introduziria `ALTER` desnecessário em objetos já aplicados.

## 6. Arquivos

- `src/features/chat/services/chat.service.ts`
- `src/features/chat/services/chat.actions.ts`
- `src/features/chat/tests/chat-actions.test.ts` (novo)
- `docs/architecture/supabase.md`
- `docs/plans/014-issue-26-security-audit.md`

## 7. Critérios de aceite (BDD)

- **Dado** um usuário autenticado que não participa da conversa, **quando** ele invoca qualquer uma das quatro actions com um `conversationId` válido, **então** nenhuma consulta ou gravação de mensagens é executada e a action retorna "Esta conversa não está disponível."
- **Dado** uma falha transitória na RPC de participação, **quando** a action é invocada, **então** ela retorna erro amigável com orientação de retry, sem mensagem crua do Supabase.
- **Dado** um participante válido, **quando** a action é invocada, **então** o comportamento atual (envio, paginação e marcação de leitura) é preservado.
- **Dado** os critérios de URLs assinadas e políticas de bucket, **quando** a issue for revisada, **então** ambos estão documentados como já atendidos, sem nova migration.

## 8. Validação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`.
