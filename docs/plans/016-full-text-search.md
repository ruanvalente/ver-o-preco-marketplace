## 1. Objetivo

Implementar Full-Text Search (FTS) nativo do PostgreSQL/Supabase para a busca pública de produtos e para a busca de anúncios do vendedor, substituindo `ILIKE '%termo%'` por busca com stemming em português, normalização de acento, sinônimos de domínio, ranking ponderado e fallback fuzzy/prefixo. Retomar e atualizar o plano não entregue em `docs/plans/008-product-search.md`. Decisão registrada em `docs/adr/0008-native-full-text-search.md`.

## 2. Estado atual (diagnóstico)

- `src/features/products/services/products.service.ts:225-231`: `or(title.ilike.%q%,description.ilike.%q%)` — substring literal, sem ranking, stemming, acento, sinônimo ou fuzzy.
- `src/features/listings/services/listing.service.ts:238-296`: busca do vendedor com `categories.name ILIKE` e `title/city/neighborhood ILIKE`.
- `src/features/chat/services/chat.service.ts:454-458`: `.or()` é apenas cursor de paginação; chat não tem busca textual.
- Favoritos, perfis e categorias: apenas filtros de igualdade; não há autocomplete nem sugestões dinâmicas.
- RPCs existentes: `get_chat_conversations`, `get_or_create_conversation`, `get_seller_chat_metrics`, `is_conversation_participant`, `is_chat_product_participant`, `replace_product_images`, `bump_conversation_activity` — nenhuma de busca.
- Banco real (MCP somente leitura): 299 produtos, 8 categorias, **0 colunas `tsvector`**, **0 índices GIN FTS**, `pg_trgm` instalado em `public` com dois índices GIN em `title`/`description` e **0 varreduras**; `EXPLAIN ANALYZE` de `ILIKE '%iphone%'` retornou Seq Scan com 244 linhas descartadas. `default_text_search_config = pg_catalog.english`. `unaccent` disponível, mas não instalado.
- RLS de `products`: anônimo lê `status = 'active'`; vendedor lê os próprios registros. Toda RPC nova será `SECURITY INVOKER`.
- `to_tsvector('portuguese', 'Telefone ...')` → `'telefon'`; `plainto_tsquery('portuguese', 'telefones')` → `'telefon'` (plural resolvido pelo stemmer).

## 3. Escopo aprovado

### Banco — `migrations/0013_full_text_search.sql`

1. `CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;`
2. `public.unaccent_immutable(text)` — wrapper `IMMUTABLE PARALLEL SAFE` com `search_path` fixo, exigido por coluna gerada.
3. `products.search_vector tsvector GENERATED ALWAYS AS (...)` com `setweight(title,'A')` e `setweight(description,'C')`, mais índice `GIN`.
4. `product_search_synonyms` (termo + aliases), RLS de leitura pública e seed de grupos de domínio: celular/smartphone/iphone/galaxy/redmi/xiaomi/motorola, notebook/laptop/macbook, sofá/sofa/poltrona etc.
5. Helper `build_product_search_query`: `plainto_tsquery` por token (AND entre tokens, OR entre token/sinônimos/prefixo), evitando que texto do usuário vire sintaxe `tsquery`.
6. RPC `search_products` (`STABLE`, `SECURITY INVOKER`, `SET search_path`): `p_search_term`, categoria por slug, faixa de preço, `p_cities text[]` (substitui o `city` único de `008` para preservar o filtro multi-cidade), condition, limite/offset e `p_sort`; fallback `word_similarity()`/`similarity()` quando não houver match; filtros `status='active'`; retorno com colunas planas do produto, categoria, vendedor, imagem principal, `rank` e `total_count` (`count(*) over()`).
7. RPC `search_owner_listings`: mesma estratégia para "Meus anúncios", com `auth.uid()` lido dentro da função; nenhum `user_id` vindo do cliente.

### Aplicação

- `getProducts()` usa a RPC quando `q` está presente; sem `q`, mantém a query atual.
- Novos mappers de linha da RPC em `products` e `listings`, reaproveitando `mapProductSummary`/`mapListingSummary`; type guards em tempo de execução e nenhum cast de linha.
- `relevance` entra em `PRODUCT_SORTS` e é o default quando `q` existe; `recent` continua como default sem busca. A opção "Mais relevantes" só aparece na barra de ordenação quando há termo.
- `getOwnerListingDashboard()` usa a RPC de owner quando há termo, preservando contagens e clamp de página.
- Cache (`use cache`, `cacheLife`, `cacheTag`), URL como fonte de verdade e estados de UI permanecem inalterados.

## 4. Estratégia de relevância

`title` (A) > nome da categoria (boost fixo de 0.1) > `description` (C). `ts_rank` com pesos explícitos; `plainto_tsquery` compõe cada token e `&&` mantém o AND entre tokens, enquanto sinônimos/prefixo entram no mesmo grupo com `||`. Assim `celular` aceita `smartphone`/`iphone`, mas `telefone samsung` continua exigindo ambos os conceitos. Typo entra só quando não há match FTS. Ordenação explícita (`price_*`) prevalece sobre relevância.

## 5. Performance

Índice GIN evita o Seq Scan medido; limites atuais (20 padrão / 48 máx., termo ≤120) permanecem. Sem `SELECT *`, sem N+1. Riscos: lock curto no `ALTER TABLE` (backfill de 299 linhas), instalação de extensão, cache e RLS — todos revisados na migration e validados com `EXPLAIN` após aplicação pelo usuário.

## 6. Não-objetivos

- Sem embeddings/pgvector: não há corpus semântico nem pipeline de embeddings que justifique custo/complexidade.
- Sem autocomplete, busca em chat, favoritos ou perfis: não há UI hoje.
- Sem mover `pg_trgm` de schema, sem mudar RLS existente, sem deploy/aplicação de migration em produção sem confirmação.
- Sem commit, push, PR ou fechamento de issue sem feedback de revisão.

## 7. Critérios de aceite (BDD)

- **Dado** um termo com plural (`telefones`), **quando** a busca é executada, **então** produtos com `telefone` são retornados pelo stemmer.
- **Dado** `celular`, **quando** a busca é executada, **então** sinônimos como `smartphone`/`iphone` são considerados.
- **Dado** `telefone samsung`, **quando** a busca é executada, **então** itens com ambos os conceitos são priorizados.
- **Dado** `iph` ou `iphnoe`, **quando** a busca é executada, **então** prefixo/fuzzy retorna correspondências razoáveis.
- **Dado** match apenas na descrição e match no título, **quando** ranqueados, **então** o título vem primeiro.
- **Dado** um usuário anônimo, **quando** chama a RPC, **então** vê somente produtos `active`.
- **Dado** um vendedor, **quando** busca seus anúncios, **então** não vê anúncios de outro vendedor.
- **Dado** um termo com caracteres de sintaxe do PostgREST/tsquery, **quando** buscado, **então** a query é normalizada sem erro nem injeção.
- **Dado** o término da implementação, **então** `typecheck`, `lint`, `test` e `build` passam.

## 8. Testes

Cenários SQL: `telefone`, `telefones`, `celular`, `smartphone`, `iphone`, `telefone samsung`, `iph`, `iphnoe`, `notebook`, `notebooks`, `sofá`/`sofa`, acentuação, paginação, filtros combinados, RLS e strings de injeção. Vitest: mock de `rpc`, mapeamento de linhas, default `relevance` em `query.test.ts`, parser de filtros e mapper de search row. O seed atual é sintético com categorias aleatórias; asserções de ranking usam fixtures controladas.

## 9. Validação e documentação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`; revisão com `reviewer`, `architect` e `security-reviewer`; nota de resolução em `docs/codebase-audit/21-full-text-search.md`. Identidade do responsável obtida via `gh api user` (login `ruanvalente`), assinatura `@ruanvalente`. Labels: `audit`, `enhancement`, `P1` (já existentes).

## 10. Ajustes pós-revisão

- `search_owner_listings` também casa cidade, bairro e nome da categoria (com boosts próprios), preservando o comportamento anterior da busca do vendedor; `sort=recent` volta a ordenar por data, com relevância apenas como desempate.
- Respostas RPC com linhas parcialmente inválidas ou `total_count` não numérico falham com mensagem humana; `total` do dashboard vem da página efetivamente buscada, inclusive após clamp.
- `getDefaultProductSort(q)` centraliza a regra de default em `utils/query.ts`, usada pelo parser, pela URL, pelo formulário GET e pela barra de ordenação.
- Least privilege explícito: `REVOKE ... FROM PUBLIC, anon, service_role` conforme a função; sinônimos só `SELECT` para `anon`/`authenticated`; `search_path = pg_catalog, extensions, public`.
- A migration foi aplicada manualmente pelo usuário antes desses ajustes; é necessário reaplicar `0013` (CREATE OR REPLACE + REVOKE/GRANT cobrem funções e ACLs; a coluna gerada não muda).
