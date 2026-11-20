# ADR-0003: Supabase with RLS as the authorization boundary

## Status

Accepted

## Date

2026-11-17

## Context

The MVP needs Auth, a relational catalog, image storage, private chat and Realtime for a small team. Authorization must cover ownership of listings and participation in conversations across server components, client components and realtime subscriptions. A small gap in any of those surfaces is a data leak.

## Decision

Supabase is the single backend: Auth, PostgreSQL, Storage and Realtime. Row Level Security is the authorization boundary; the backend never trusts client state for ownership or role. Service-role credentials never reach the browser. All schema changes go through versioned `migrations/NNNN_*.sql` files, including RLS policies and Storage policies.

## Alternatives Considered

### Custom backend (Node API + separate database)
- Pros: full control, easier to move providers later.
- Cons: significant work for auth, realtime and storage; small team capacity; more surfaces to secure.
- Rejected: cost is disproportionate to MVP scope.

### Firebase
- Pros: mature auth and realtime.
- Cons: weaker relational model for listings/conversations; different authorization model; would not fit the SQL-first schema already in `migrations/`.
- Rejected: Supabase fits the relational domain and the existing codebase.

## Consequences

- `src/lib/supabase/` holds clients; feature services hold queries; components do not embed large queries.
- Every new table needs RLS in the same migration; every private bucket needs an equivalent Storage policy.
- Schema changes via MCP `execute_sql`/`apply_migration` are forbidden by `docs/ai/security.md`.
