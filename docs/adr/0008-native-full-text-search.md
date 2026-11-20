# ADR-0008: Native PostgreSQL full-text search

## Status

Accepted

## Date

2026-11-20

## Context

Catalog search was implemented with `ILIKE` over title, description, category and location. That approach cannot stem Portuguese plurals, ignore accents consistently, rank title matches above description matches, or expand known aliases such as `celular`/`smartphone`. The seller dashboard had a separate, diverging query. Audit `docs/codebase-audit/21-full-text-search.md` (issue #56) found no semantic corpus or embedding pipeline that would justify vector search, and the catalog is still small enough to run in PostgreSQL.

## Decision

Use native PostgreSQL full-text search for both the public catalog and the seller dashboard:

- `products.search_vector` is a generated `tsvector` combining `title` (weight A) and `description` (weight C) with `unaccent` and the `portuguese` configuration, indexed with GIN.
- `product_search_synonyms` holds curated aliases; `build_product_search_query` expands every term with its aliases and a prefix match.
- `search_products` and `search_owner_listings` are `SECURITY INVOKER` RPCs so existing RLS remains the authorization boundary. They use `ts_rank`, fall back to `pg_trgm` similarity only when FTS finds nothing, and return `total_count` via `count(*) OVER ()`.
- The seller RPC keeps the previous location/category matching as additional FTS and fuzzy signals.
- Search/filter state stays in the URL. With a search term, `sort=relevance` is the default; without one, `sort=recent` is preserved.

## Alternatives Considered

### Keep `ILIKE` and add more `OR` clauses

- Pros: no migration; trivial change.
- Cons: no stemming, ranking or predictable accent handling; alias logic spreads across services; full scans grow with the catalog.
- Rejected: it would not fix the audit findings.

### pgvector / embeddings and semantic search

- Pros: handles conceptual similarity without a synonym list.
- Cons: requires an embedding pipeline, provider calls, storage and reindexing; no semantic corpus or evaluation set exists; overkill for title/description lookup.
- Rejected: cost and operational complexity are not justified by the current use case.

### External search service (Elasticsearch, Typesense)

- Pros: mature ranking and faceting.
- Cons: new infrastructure, sync job, second authorization surface and operational burden for a small catalog.
- Rejected: PostgreSQL already covers the required relevance and filtering.

## Consequences

- Schema changes live in `migrations/0013_full_text_search.sql`; the column, functions, grants and index are versioned together.
- Synonyms are readable by `anon`/`authenticated` and writable only by privileged roles; functions are least-privilege and pinned to a fixed `search_path`.
- Relevance tuning is local and reviewable, but the curated synonym list needs maintenance as new product vocabulary appears.
- Realtime, chat search and autocomplete remain out of scope; adding them should be a separate decision.
- The migration must be reapplied after the post-review corrections before validating query plans and the term battery in the environment where it was already applied.
