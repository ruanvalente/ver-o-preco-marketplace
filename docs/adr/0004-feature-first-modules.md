# ADR-0004: Feature-first module boundaries

## Status

Accepted

## Date

2026-11-17

## Context

The product spans auth, profiles, catalog, listings, favorites, chat and dashboard. A single global `components/ services/ hooks/ utils/ types/` tree mixes unrelated domain rules and makes ownership unclear as the MVP grows.

## Decision

Product code lives in `src/features/<feature>/`. Each feature owns its components, hooks, services, schemas, types, validation and tests. Shared code is extracted to `src/components/`, `src/lib/`, `src/hooks/` or `src/types/` only when it is genuinely shared. Domain components never go into `src/components/ui/`; that directory holds generic primitives only.

## Alternatives Considered

### Layer-based global directories
- Pros: familiar and simple at the start.
- Cons: domain rules leak into generic components; no clear owner; changes spread across unrelated folders.
- Rejected: conflicts with the maintainability and isolation principles in `AGENTS.md`.

### One package per feature (monorepo)
- Pros: hard boundaries enforced by tooling.
- Cons: overhead disproportionate to a single application MVP.
- Rejected: premature for current scale; directory boundaries plus review are enough.

## Consequences

- Cross-feature imports are a smell and should be reviewed (`architect` agent).
- New features get a plan in `docs/plans/` before implementation.
- `docs/architecture/modules.md` records the current module map.
