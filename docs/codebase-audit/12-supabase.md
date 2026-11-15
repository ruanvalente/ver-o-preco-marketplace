# Phase 12 — Supabase

## Objetivo
Garantir queries, RLS, índices, realtime, storage, RPC.

## Contexto atual
Uso de `@supabase/ssr`, `lib/supabase/{client,server,public,middleware}.ts`, RPCs (`get_chat_conversations`, `get_or_create_conversation`), RLS em todas as tabelas, storage buckets (`product-images`, `avatars`, `chat-images`).

## Problemas encontrados

### [P1] N+1 queries em `getSellerChatMetrics`
**Arquivo:** `src/features/chat/services/chat.service.ts`
**Problema:** 3 queries separadas em Promise.all.
**Impacto:** Overhead.
**Por que:** Múltiplas round-trips.
**Solução:** Criar RPC `get_seller_chat_metrics`.
**Arquivos envolvidos:** `chat.service.ts`.

### [P1] Índices compostos ausentes para products
**Arquivo:** `migrations/0009.sql`
**Problema:** Query `products(status, city, created_at)` sem índice explícito.
**Impacto:** Queries lentas em catálogo grande.
**Por que:** Falta de índice.
**Solução:** Adicionar índice composto.
**Arquivos envolvidos:** `migrations/0010.sql`.

### [P1] `getFavoriteProductIds` sem cache
**Arquivo:** `src/features/favorites/services/favorites.service.ts`
**Problema:** Query RPC em cada chamada.
**Impacto:** Taxa extra.
**Por que:** Chamado em cada página.
**Solução:** Adicionar `cache()`.
**Arquivos envolvidos:** `favorites.service.ts`.

### [P2] `getPublicUrl` em `chat.service.ts` para avatars
**Arquivo:** `src/features/chat/services/chat.service.ts`
**Problema:** `getPublicUrl` é usado para avatars (bucket público) e product-images (público). Correto, mas pode causar confusão se bucket for privado.
**Impacto:** Nenhum.
**Por que:** Documentação.
**Solução:** Documentar que bucket é público.

## Solução proposta
1. Criar RPC `get_seller_chat_metrics`.
2. Adicionar índice composto.
3. Adicionar cache em `getFavoriteProductIds`.
4. Documentar uso de `getPublicUrl`.

## Arquivos envolvidos
- Modificar: `chat.service.ts`, `favorites.service.ts`
- Criar: `migrations/0010.sql`, documentação.

## Plano de implementação
1. Criar RPC.
2. Adicionar índice.
3. Adicionar cache.
4. Documentar.

## Componentização
- Nenhuma.

## Performance
- Reduzir round-trips.

## Acessibilidade
- Nenhuma.

## Segurança
- RLS existente.

## Supabase
- RPCs, índices, cache.

## Testes
- Testes de performance de queries.

## Critérios de aceite
- [ ] RPC criada.
- [ ] Índice adicionado.
- [ ] Cache adicionado.

## Riscos
- Nenhum.

## Dependências
- Phase 01.

## Ordem de implementação
1. Criar RPC.
2. Adicionar índice.
3. Adicionar cache.