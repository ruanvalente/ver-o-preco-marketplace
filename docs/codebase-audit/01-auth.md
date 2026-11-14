# Phase 01 — Autenticação

## Objetivo
Permitir registro, login, logout, recuperação e redefinição de senha com segurança e usabilidade.

## Contexto atual
Módulo Auth com pasta `features/auth/`. Usa Supabase Auth via `auth.service.ts` e `auth.actions.ts`. Tipagem com `auth.types.ts` e schemas de validação. Cadastro restrito a municípios do Pará. Tem proteção contra open redirect (`auth-redirect.ts`). RLS nas tabelas `profiles` e `auth.users`.

## Problemas encontrados

### [P0] Chat signed-URL does not validate conversation ownership
**Arquivo:** `src/features/chat/services/chat-storage.service.ts`, `src/features/chat/services/chat.service.ts`
**Problema:** `getChatImageUrl` e `createSignedUrls` não verificam se o caminho de armazenamento pertence ao solicitante. O bucket é privado, mas a autorização depende de RLS; talvez o RLS não restrinja signed URLs além de plugins? Pode permitir acesso a qualquer URL assinada, se descoberta.
**Impacto:** Viola a propriedade do chat; exposição privada de imagens.
**Por que:** Assinatura de URL é usada para visualização temporária; deve garantir que apenas participantes da conversa a solicitem.
**Solução:** Antes de emitir a URL assinada, verifique se a `conversationId` pertence ao usuário solicitante (via chamada RPC `check_conversation_participant`). Também adicionar `deleteChatImage` com verificação de permissão.
**Arquivos envolvidos:** Modificar `chat-storage.service.ts`, `chat.service.ts`, possivelmente adicionar uma nova RPC `check_conversation_participant` no Supabase.

### [P0] Auth actions do not re-check ownership before mutation
**Arquivo:** `src/features/chat/services/chat.actions.ts`, `src/features/favorites/services/favorites.actions.ts`, `src/features/listings/services/listing.actions.ts`, `src/features/profile/services/profile.actions.ts`
**Problema:** Server actions chamam serviços (`chat.service.startOrGetConversation`, `favorites.service.add`, `listing.service.publish`) que já usam RLS. No entanto, as Server Actions não verificam novamente que o usuário é proprietário da entidade após a obtenção do usuário via `getCurrentUser`. Se o `getCurrentUser` retornar um usuário que depois se torna inválido (ex: desativado), a ação ainda pode prosseguir; RLS ainda protegerá, mas ainda assim seria útil para mensagens de erro amigáveis.
**Impacto:** Possível uso de ações por usuários maliciosos, obtenção de notificações de erro confusas.
**Por que:** É uma dupla verificação; melhora a experiência do usuário com mensagens de erro melhores.
**Solução:** Adicionar funções auxiliares `ensureOwnership` (via servidor) ou verificar no cliente antes da mutação; preferir reverter para o servidor que verifica os IDs.
**Arquivos envolvidos:** `features/*-actions.ts`, `features/*-service.ts` adicionar função de verificação.

### [P0] RLS missing table-level policies for some features
**Arquivo:** `migrations/0009.sql` — verificar ausência de políticas `FOR ALL`. Refinar RLS para chat_images (bucket privado) pode ser necessário.
**Problema:** O Supabase RLS em `messages`, `conversations`, `favorites`, `products` está presente; mas políticas para `product_images` bucket podem estar ausentes.
**Impacto:** Risco de acesso público a imagens de produtos no storage se as políticas não estiverem explícitas.
**Por que:** O bucket `product-images` usa RLS; mas as políticas estão ausentes.
**Solução:** Criar políticas `FOR SELECT` e `FOR INSERT` limitadas pelo `seller_id` no `product_images` bucket.
**Arquivos envolvidos:** `migrations/0010.sql` adicionar políticas.

## Solução proposta

1. **Implementar verificação de propriedade para URLs assinadas do chat**
   - Adicionar RPC `check_conversation_participant(conversation_id, user_id)` retornando booleano.
   - Em `getChatImageUrl`, chamar RPC antes de criar signed URL; se falso, retornar erro.
   - Em `addSignedImageUrls`, também verificar por caminho conhecido (podemos adicionar mapping).

2. **Adicionar verificação de propriedade em Server Actions**
   - Centralizar `requireOwnership(userId, entityId)` em `features/auth/services/session.service.ts`.
   - Chamar em cada Server Action após obter o usuário, abortar com falha amigável.

3. **Garantir políticas para bucket de imagens de produtos**
   - Migrar políticas RLS para `product-images` bucket.

## Arquivos envolvidos

- Modificar `src/features/chat/services/chat-storage.service.ts`
- Modificar `src/features/chat/services/chat.service.ts`
- Modificar `src/features/chat/services/chat.actions.ts` (adicionar verificação)
- Modificar `src/features/favorites/services/favorites.actions.ts`
- Modificar `src/features/listings/services/listing.actions.ts`
- Modificar `src/features/profile/services/profile.actions.ts`
- Criar `migrations/0010.sql` para políticas de bucket de storage.

## Plano de implementação

1. Criar RPC `check_conversation_participant` no Supabase.
2. Atualizar `chat-storage.service.ts` para verificar a propriedade antes de assinar.
3. Adicionar função auxiliar `requireOwnership` em `session.service.ts`.
4. Atualizar cada Server Action para chamar a verificação.
5. Executar `bun run migrate` (se CLI estiver presente) ou `supabase db push`.

## Componentização

- Nova RPC no Supabase.
- Hook `useChatOwnership`? não necessário.
- Serviços de verificação.
- Nenhuma nova abstração.

## Performance

- Adicionar uma verificação extra por requisição (chamada RPC) tem baixo impacto; apenas para chat images.

## Acessibilidade

- Nenhuma mudança na UI.

## Segurança

- Alvo: Mitigar vazamento de imagens privadas, garantir que apenas participantes possam acessá-las.

## Supabase

- Adicionar RPC `check_conversation_participant`.
- Adicionar políticas RLS para bucket de storage `product-images`.

## Testes

- Adicionar teste de unitário para `chat-storage.service.ts` `getChatImageUrl` verificar propriedade.
- Adicionar teste de integração para Server Actions verificar falha para usuário não proprietário.
- Adicionar teste de migração para `migrations/0010.sql`.

## Critérios de aceite

- Ao solicitar URL assinada para imagem de chat, se o usuário não for participante, retornar erro (`404` ou `403`).
- Após ação do usuário (ex: enviar mensagem com anexo), se o usuário não for proprietário, a ação falha com `AuthFailure` amigável.
- Não é possível listar imagens do bucket diretamente via storage admin (já protegido por RLS).

## Riscos

- Alterar `chat-storage.service.ts` pode afetar o fluxo de upload. Garantir que o upload seja permitido (já usa RLS no Supabase Auth?). Adicionar verificação de permissão após upload.
- Interferência com fluxos existentes: adicionar uma nova RPC pode afetar a latência do chat.
- Tempo de migração: adicionar políticas de bucket é rápido.

## Dependências

- RPC `check_conversation_participant` depende de `conversations` e `profiles` tabelas.
- Políticas de bucket dependem de funções `auth.uid()`.

## Ordem de implementação

1. Criar RPC `check_conversation_participant`.
2. Atualizar `chat-storage.service.ts`.
3. Criar `requireOwnership` helper.
4. Atualizar Server Actions.
5. Migrar políticas de bucket.
6. Executar testes.