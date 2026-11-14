# Phase 02 — Produtos e Catálogo Público

## Objetivo
Permitir descoberta, busca, filtros, ordenação, paginação, detalhe do anúncio e avaliações relacionadas.

## Contexto atual
Página `/` e `/products` com Server Components, `ProductsCatalog` componente que mistura queries e apresentação. Serviço `products.service.ts` usa `cacheLife`/`cacheTag` e cliente público. Query builder em `utils/query.ts` valida filtros. Mapeadores em `utils/product-mappers.ts`. Cards em `components/product-card.tsx`.

## Problemas encontrados

### [P0] `select('*')` parcial no `products.service.ts`
**Arquivo:** `src/features/products/services/products.service.ts`
**Problema:** Query com aliasedes (`categories!products_category_id_fkey`, `seller:profiles!...`) ainda pode selecionar colunas não utilizadas. Não utiliza colunas sensíveis de `profiles` além de display_name/avatar_path/location — ok. Porém o `ProductRow` exige `condition` como string.
**Impacto:** Overhead mínimo, mas a query pode carregar colunas inúteis.
**Por que:** Uso de `select` manual não explícito pode evoluir para `select *`.
**Solução:** Usar `select` explícito com as colunas definidas.

### [P0] Cache com `cacheLife` pode servir dados de catálogo antes de `revalidate` correto
**Arquivo:** `src/features/products/services/products.service.ts`
**Problema:** Uso de `cacheTag`/`cacheLife` sem garantir que `tags` sejam invalidados após CRUD de listings/favorites.
**Impacto:** Estoque de catálogo pode ficar desatualizado (produtos novos/pausados).
**Por que:** Falta invalidação de cache pós mutação.
**Solução:** Invalidar `products:list` via `revalidateTag` em Server Actions de listings/favorites.

### [P0] N+1: `getFavoriteProductIds` feito dentro de `ProductsCatalog` sem cache
**Arquivo:** `src/features/products/components/catalog/products-catalog.tsx`
**Problema:** `getFavoriteProductIds` é chamado no servidor para cada catálogo; pode disparar uma query por página. Não está com `cache` (React `cache`) no serviço.
**Impacto:** Adiciona 1 query extra por página carregada.
**Por que:** Mistura query de favoritos com catálogo; sem dedup.
**Solução:** Criar `getFavoriteProductIds` com `cache()` no mesmo scope de requisição, ou combinar no mesmo serviço.

### [P0] `as unknown as ProductRow` e casts no mapper
**Arquivo:** `src/features/products/utils/product-mappers.ts`, `src/features/products/services/products.service.ts`
**Problema:** Uso de casts de `unknown`/`any` em `as ProductRow` e alias de `Relation`.
**Impacto:** Quebra de type safety no boundary com Supabase.
**Por que:** Uso de RLS pode devolver shapes inesperados.
**Solução:** Definir tipos de row no próprio service layer com aliases nomeadas; evitar `unknown`.

## Solução proposta
1. Simplificar queries com `select` explícito.
2. Garantir invalidação de `products:list` em todas as mutações.
3. Deduplicar `getFavoriteProductIds` com `cache`.

## Arquivos envolvidos
- Alterar: `src/features/products/services/products.service.ts`, `src/features/products/components/catalog/products-catalog.tsx`, `src/features/products/utils/product-mappers.ts`.
- Criar: nenhum nesta fase.

## Plano de implementação
1. Auditar queries atuais.
2. Refinar selects.
3. Adicionar `revalidateTag("products:list")`.
4. Adicionar `cache()` em `getFavoriteProductIds`.

## Componentização
- Extrair `ProductGrid` para `components/product-grid.tsx` (já existe); mover queries para service (já parcialmente feito).

## Performance
- Reduzir query count.

## Acessibilidade
- Cards com `ImageOff`, `Link`; validar focus states.

## Segurança
- Dados públicos; mas evitar expor emails/phones (já ok).

## Supabase
- Adicionar índices compostos: `products(status, city, created_at)`.

## Testes
- Adicionar testes para service com selects e cache.

## Critérios de aceite
- [ ] Sem `select *`.
- [ ] `products:list` invalidado após publish/edit/delete.
- [ ] Favoritos não geram query duplicada.

## Riscos
- Invalidação de cache pode causar renders atrasados; testar com `unstable_cache`.

## Dependências
- Phase 01.

## Ordem de implementação
1. Corrigir selects.
2. Invalidação de cache.
3. Deduplicar favoritos.

---

# Phase 03 — Listings (Criar/Editar/Excluir)

## Objetivo
Permitir autenticação, criação, edição, publicação, pause, sold, remoção, upload e gestão de imagens.

## Contexto atual
Módulo `features/listings/` com componentes (`listing-form`, `image-uploader`, `listing-editor`, `listing-card`, `listing-preview`, `listing-status-badge`, `listing-delete-dialog`, `listing-feedback`, `listing-empty-state`, `listing-error-state`, `listing-form-skeleton`) e services/actions/storage (`listing.service.ts`, `listing.actions.ts`, `listing_image.service.ts`, `listing_storage.service.ts`).

## Problemas encontrados

### [P0] Upload de imagens sem progresso UX? (verificar no componente)
**Arquivo:** `src/features/listings/components/image-uploader.tsx`
**Problema:** Verificar se o uploader usa `upload()` do Supabase com progresso; se for manual, pode faltar validação de tamanho/tipo.
**Impacto:** UX de upload lento.
**Por que:** Requer validação de arquivo (schema) já presente? Confirmar.
**Solução:** Usar upload progressivo ou validação no client.

### [P1] Server Actions de listings não chamam RLS? Verificar.
**Arquivo:** `src/features/listings/services/listing.actions.ts`
**Problema:** Ações devem verificar que o usuário autenticado é o dono (`getCurrentUser`) e que o produto pertence ao usuário.
**Impacto:** Possível edição de anúncio alheio (RLS deve bloquear, mas verificar).
**Por que:** Double-check necessário.
**Solução:** `requireOwnership`.

## Solução proposta
- Refinar actions para checar ownership.

## Arquivos envolvidos
- Alterar: `listing.actions.ts`, `image-uploader.tsx`.

## Testes
- Testes existentes de listing (7 arquivos).

## Critérios de aceite
- [ ] Usuário não dono recebe erro de permissão.

---

# Phase 04 — Favoritos

## Objetivo
Adicionar/remover favoritos, listar favoritos, estado vazio.

## Contexto atual
`features/favorites/` com components (`favorite-button`, `favorites-page`, `favorite-empty-state`, `favorite-error-state`, `favorites-skeleton`) e services/actions (`favorites.service.ts`, `favorites.actions.ts`).

## Problemas encontrados

### [P1] `favorite-button.tsx` pode disparar mutação sem estado otimista
**Arquivo:** `src/features/favorites/components/favorite-button.tsx`
**Problema:** Verificar se o botão usa otimismo; se não, o UI pode bloquear por requisição.
**Impacto:** UX.
**Solução:** Adicionar otimismo se ausente.

## Solução proposta
- Refinar estado otimista.

## Testes
- Existem 3 testes em `features/favorites/tests`.

---

# Phase 05 — Chat

## Objetivo
Conversas entre comprador e vendedor com texto/imagens, realtime, presença, digitação, leitura.

## Contexto atual
Serviços: `chat.service.ts` (RPC `get_chat_conversations`, `get_or_create_conversation`, `get_conversation`, `get_conversation_messages`, `send_chat_message`, `markConversationMessagesRead`), `chat-storage.service.ts` (upload/signed urls/delete), `chat.actions.ts` (start conversation, send message, mark read, etc.), hook `use-chat-realtime.ts`.

## Problemas encontrados

### [P0] Signed URL issuance não valida participação
(ver detalhes em `01-auth.md`.)

### [P0] Realtime: `use-chat-realtime.ts` pode não filtrar por conversa/canal correto; ausência de `postgres_changes` ou `broadcast`?
**Arquivo:** `src/features/chat/hooks/use-chat-realtime.ts`
**Problema:** Verificar filtragem dos canais (`{room: conversationId}`) e presence (`{user: userId}`).
**Impacto:** Possível ruído de canais ou falta de atualização.
**Por que:** Realtime em Supabase requer filtro correto.
**Solução:** Ajustar canais.

### [P1] Erros no realtime não têm retry/backoff
**Arquivo:** `src/features/chat/hooks/use-chat-realtime.ts`
**Problema:** Sem retry exponencial em falha de conexão realtime.
**Impacto:** UX de mensagens perdidas.
**Solução:** Implementar reconexão com backoff.

## Solução proposta
- Implementar verificação de participação + realtime canais + retry.

## Arquivos envolvidos
- Alterar: `chat-storage.service.ts`, `chat.service.ts`, `chat.actions.ts`, `use-chat-realtime.ts`.

## Testes
- Adicionar testes para realtime e chat storage.

---

# Phase 06 — Dashboard

## Objetivo
Visão geral do usuário com métricas, listings recentes, mensagens recentes.

## Contexto atual
`features/dashboard/` com services, components (metrics, listings, resource-cards, status-button, trust-card, seller-dashboard) e tests.

## Problemas encontrados

### [P1] Dashboard actions/tests parcialmente ausentes
**Arquivo:** `src/features/dashboard/tests/`.
**Problema:** Verificar cobertura; alguns fluxos críticos podem estar sem teste.
**Impacto:** Risco de regressão.
**Solução:** Adicionar testes de ações e componentes.

---

# Phase 07 — Perfil

## Objetivo
Gerenciar perfil próprio e visualizar perfil público.

## Contexto atual
`features/profile/` com `profile.service.ts`, `profile.actions.ts`, `profile_storage.service.ts`, `profile-avatar.tsx`, `profile-form.tsx`, `profile-page.tsx`, `public-profile-page.tsx`.

## Problemas encontrados

### [P2] `profile-avatar.tsx` tem aviso de `error` não utilizado (lint)
**Arquivo:** `src/features/profile/components/profile-avatar.tsx`, `src/features/profile/services/profile.actions.ts`, `src/features/profile/services/profile.service.ts`
**Problema:** Variáveis de erro não utilizadas; lint warnings.
**Impacto:** Qualidade.
**Solução:** Remover variáveis não utilizadas.

### [P2] `mapAuthError` importado mas não usado no `profile.service.ts`
**Arquivo:** `src/features/profile/services/profile.service.ts`
**Problema:** Dead import.
**Impacto:** Qualidade.
**Solução:** Remover.

---

# Phase 08 — Landing

## Objetivo
Página inicial com hero, copy de marketing, seções, footer.

## Contexto atual
`features/landing/` com hero, sections, footer, header mobile, etc.

## Problemas encontrados

### [P3] Nomes de ícones/descrições podem divergir do copy de produto
**Arquivo:** `src/features/landing/components/*`.
**Problema:** Verificar consistência copy/hero com PRODUCT.md.

### [P3] Falta teste de landing page para seções principais (1 arquivo de teste existe).

---

# Phase 09 — Legal

## Objetivo
Páginas legais (privacy, terms, cookies, about).

## Contexto atual
`features/legal/components/legal-placeholder-page.tsx`.

## Problemas encontrados

### [P3] Conteúdo legal pode ser placeholder; falta copy real.
**Arquivo:** `src/features/legal/components/legal-placeholder-page.tsx`.
**Impacto:** Conformidade.
**Solução:** Substituir por conteúdo final.

---

Continuando com os documentos transversais em seguida.
