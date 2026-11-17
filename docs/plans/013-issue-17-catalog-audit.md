## 1. Objetivo

Implementar a Phase 02 da auditoria (issue #17): eliminar casts inseguros no
boundary do Supabase, garantir invalidação do cache do catálogo após mutações e
deduplicar a consulta de favoritos no mesmo request.

## 2. Escopo

- `select` explícito centralizado e tipos de row nomeados usados pelas queries
  públicas e de favoritos, sem `as unknown as`.
- Tag única `products:list` para os dados cacheados do catálogo.
- Invalidação da tag nas Server Actions de listings (que alteram os dados do
  catálogo).
- `getFavoriteProductIds` com `cache()` do React e chave canônica estável.
- Migration com índice parcial `products (city, created_at DESC) WHERE status =
  'active'`.
- Testes de service/actions cobrindo selects, tag e dedupe.

## 3. Não-objetivos

- Reescrever componentes de apresentação do catálogo.
- Alterar RLS, Storage ou contratos de UI.
- Aplicar a migration em ambiente remoto (a escrita via MCP é proibida pela
  política do repositório; a migration versionada é a única saída).
- Deploy ou push.

## 4. Decisões

1. **Tipagem**: o cliente Supabase não é gerado a partir do schema, então as
   queries passam a declarar o tipo de retorno no próprio `.select<Query, Row>()`,
   usando `ProductRow`/`FavoriteProductRow` com aliases nomeados. Isso remove os
   casts `as unknown as` sem introduzir dependências de runtime.
2. **Tag**: `cacheTag("products:list")` substitui `"products"` em todas as
   funções cacheadas de `products.service.ts`, para que a invalidação nomeada
   pela issue tenha efeito real.
3. **Invalidação**: em Server Actions, `updateTag("products:list")` é usado no
   lugar de `revalidateTag("products:list")`. O segundo argumento do
   `revalidateTag` de um argumento só está deprecado no Next 16 e o
   `updateTag` é a API recomendada para *read-your-own-writes*, garantindo que
   o próximo request já busque dados frescos. O padrão já era usado em
   `listing.actions.ts`. Favoritos **não** invalidam essa tag: o estado de
   favorito é lido por request em componentes dinâmicos (`connection()`/
   `getCurrentUser()`) via `getFavoriteProductIds`, fora de `"use cache"`, e o
   `PRODUCT_SELECT` não contém contagem de favoritos. Invalidar o cache global
   do catálogo a partir de uma ação por usuário seria desnecessário e
   permitiria amplificação de carga (DoS de cache) por chamadas repetidas.
   `setFavoriteAction` mantém apenas `revalidatePath("/favorites")`.
4. **Dedupe**: `getFavoriteProductIds` normaliza a lista de UUIDs em uma chave
   canônica (ordination + dedupe) e delega para uma função embrulhada em
   `cache()` que recebe **apenas essa string primitiva**. Isso evita que arrays
   recém-criados pelos call sites quebrem a memoização por identidade.
5. **Índice**: `CREATE INDEX IF NOT EXISTS` em `public.products (city,
   created_at DESC) WHERE status = 'active'`. O índice é parcial para seguir a
   convenção de `0003_products.sql` (não indexar drafts/sold). `status` como
   primeira coluna de um índice parcial seria redundante, e a home já é
   atendida por `products_active_created_at_idx`. Consultei o schema via MCP
   somente leitura e confirmei que o índice ainda não existe.

## 5. Arquivos

- `src/features/products/utils/product-mappers.ts`
- `src/features/products/services/products.service.ts`
- `src/features/favorites/services/favorites.service.ts`
- `src/features/favorites/services/favorites.actions.ts`
- `src/features/listings/services/listing.actions.ts`
- `migrations/0011_products_catalog_index.sql`
- testes de service/actions e este plano.

## 6. Critérios de aceite (BDD)

- **Dado** uma query pública de catálogo, **quando** o service monta o select,
  **então** todas as colunas são explícitas e o resultado é tipado sem casts.
- **Dado** um anúncio publicado, editado, pausado ou removido, **quando** a
  Server Action termina, **então** `products:list` é invalidado.
- **Dado** um favorito alternado, **quando** a action termina, **então** apenas
  `/favorites` é revalidado; o catálogo não é invalidado porque nenhum dado
  cacheado sob `products:list` depende de favoritos.
- **Dado** dois componentes no mesmo request pedindo os mesmos IDs de
  favoritos, **quando** os IDs são equivalentes em ordem diferente, **então**
  uma única consulta ao Supabase é emitida dentro do scope do `cache()`.

## 7. Validação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`.
