# Ver-o-Preço — Codebase Audit Overview

> **Status:** Read-only audit. No code was modified during this phase.
> **Date:** 2026-11-14
> **Auditor role:** Staff Engineer / Architect

---

## 1. Executive Summary

The Ver-o-Preço codebase is a **well-structured Next.js 16 + Supabase marketplace**
with clear feature-first architecture. The project follows its own documented
conventions (`AGENTS.md`, `DESIGN.md`, `PRODUCT.md`) closely. The main risks are
**not** architectural failures, but rather gaps in:

1. **Test coverage on critical write paths** (chat, favorites, dashboard actions).
2. **Accessibility completeness** (some interactive elements lack focus/ARIA).
3. **Supabase RLS edge cases** (chat images, presence, typing).
4. **Performance instrumentation** (no measurements exist; only static analysis).
5. **SEO metadata** on dynamic public routes.

Overall architecture classification: **Boa, com ressalvas pontuais**.

---

## 2. Current Architecture

```
src/
├── app/
│   ├── (auth)/         login, register, forgot-password, reset-password, access-recovery
│   ├── (dashboard)/    dashboard, listings, favorites, messages, profile
│   ├── (public)/       home, products, products/[id], profile/[id], legal pages
│   ├── auth/callback/  PKCE exchange route
│   └── error.tsx, not-found.tsx, loading.tsx, layout.tsx, theme.css
├── components/
│   ├── ui/             shadcn primitives (button, input, dialog, sheet, badge, avatar, skeleton, sonner, switch, textarea, dropdown-menu, alert, card, label)
│   └── layout/         main-header, marketplace-header, marketplace-footer, chat-notification-badge, header-auth, header-search-form, location-selector, marketplace-account-area, marketplace-mobile-account, marketplace-mobile-menu, marketplace-create-listing-action, brand-logo
├── config/             env.ts (centralized env validation)
├── features/
│   ├── auth/           components, hooks, schemas, services, tests, types, utils, data
│   ├── chat/           components, hooks, schemas, services, tests, types, constants
│   ├── dashboard/      components, services, tests, types, utils
│   ├── favorites/      components, services, tests, types
│   ├── landing/        components, data, tests, types
│   ├── legal/          components
│   ├── listings/       components, hooks, schemas, services, tests, types, utils, constants
│   ├── products/       components, services, tests, types, utils, data
│   └── profile/        components, schemas, services, types, constants
├── lib/
│   ├── supabase/       client.ts, server.ts, middleware.ts, public.ts, index.ts
│   ├── utils/          cn, format helpers
│   └── validations/    shared validation helpers
└── test/               setup.ts, smoke.test.tsx
```

### Key architectural decisions observed

- **Feature-first**: each domain owns its components, services, schemas, types, tests, utils.
- **Server Components by default**: pages and services are async server functions; `"use client"` appears only where interactivity is required (filters, chat, forms).
- **Supabase isolation**: `lib/supabase/{client,server,public,middleware}.ts` centralizes client creation; `public.ts` is a stateless client for cached catalog reads.
- **Service layer**: every feature exposes a `services/*.service.ts` and, when mutations exist, `*.actions.ts` (Server Actions).
- **Domain mappers**: `utils/*-mappers.ts` translate Supabase rows into canonical domain types; UI never sees DB shapes.
- **URL as state**: catalog filters, listings filters, dashboard filters live in the query string.
- **RLS as authorization boundary**: `requireUser` on routes + Server Actions; RLS on tables; Storage policies per bucket.

---

## 3. Main Problems Found

| # | Area | Problem | Severity |
|---|------|---------|----------|
| 1 | Security | Chat signed-URL issuance needs review for participant-only scope | 🟠 High |
| 2 | Security | `getPublicUrl` used for product images is fine, but avatar resolution bypasses signed URLs (public bucket) — acceptable by design, document it | 🟡 Medium |
| 3 | Supabase | No index review against real query plans; `products(status, city, created_at)` composite index is implied but not explicit in migrations | 🟡 Medium |
| 4 | Performance | No runtime measurements; `"use cache"` usage is broad and may serve stale filters | 🟡 Medium |
| 5 | Accessibility | Focus ring on custom selects, sheet focus trap verification, and `aria-live` on chat incoming messages need confirmation | 🟡 Medium |
| 6 | Testing | Chat realtime, favorites toggle, dashboard actions lack dedicated tests | 🟠 High |
| 7 | SEO | `products/[id]` and `profile/[id]` need explicit `metadata` export verification | 🟡 Medium |
| 8 | Code Quality | Some components exceed 200 lines; `products-catalog.tsx` mixes data + presentation | 🟢 Low |
| 9 | TypeScript | A few `as unknown as ProductRow` casts in service layer | 🟢 Low |
| 10 | Next.js | `proxy.ts` matcher excludes static assets correctly; confirm `cacheComponents` interactions with `connection()` | 🟢 Low |

---

## 4. Critical Risks

1. **Chat image signed URLs**: if the signed-URL endpoint does not verify
   conversation participation, private images leak. Must verify in
   `features/chat/services/chat-storage.service.ts`.
2. **Unread count / presence**: if `get_chat_conversations` or presence channels
   are not scoped to the participant, data leaks across users.
3. **Server Action authorization**: every action must re-check ownership; the
   listings module does this, but chat/favorites/dashboard actions need the same
   explicit verification.

---

## 5. Main Opportunities

1. **Extract a shared `ServiceResult<T>` helper** already used by products; extend
   to chat/favorites/dashboard for uniform error handling.
2. **Centralize empty/error/skeleton states** per DESIGN.md (already partially
   done in products; replicate pattern to listings, chat, dashboard).
3. **Add `aria-live` chat region** and `role="log"` for new messages.
4. **Introduce Playwright E2E** for login → publish → chat → favorite flow.
5. **Add composite indexes** for the hottest query patterns once query plans are
   captured.

---

## 6. Feature Map

| Feature | Routes | Primary files | Tests |
|---------|--------|---------------|-------|
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/access-recovery`, `/auth/callback` | `features/auth/**` | 7 test files |
| Products (catalog) | `/`, `/products`, `/products/[id]`, `/profile/[id]` | `features/products/**` | 9 test files |
| Listings | `/listings`, `/listings/new`, `/listings/[id]/edit` | `features/listings/**` | 7 test files |
| Favorites | `/favorites`, favorite button on cards | `features/favorites/**` | 3 test files |
| Chat | `/messages`, `/messages/[conversationId]` | `features/chat/**` | 3 test files |
| Dashboard | `/dashboard` | `features/dashboard/**` | 4 test files |
| Profile | `/profile` (own), `/profile/[id]` (public) | `features/profile/**` | 1 test file |
| Landing | `/` (marketing) | `features/landing/**` | 1 test file |
| Legal | `/privacy`, `/terms`, `/cookies`, `/about` | `features/legal/**` | 0 |

---

## 7. Roadmap (proposed)

Audit files created under `docs/codebase-audit/`:

```text
00-overview.md          — this file
01-auth.md              — authentication & authorization
02-products.md          — public catalog & product detail
03-listings.md          — create/edit/delete listings
04-favorites.md         — favorites toggle & list
05-chat.md              — conversations, messages, realtime
06-dashboard.md         — seller dashboard
07-profile.md           — profile management & public profile
08-landing-legal.md     — marketing landing + legal pages
09-performance.md       — Core Web Vitals, caching, instrumentation
10-accessibility.md     — WCAG 2.2 AA gaps
11-security.md          — RLS, signed URLs, action ownership
12-supabase.md          — queries, indexes, RPCs, storage
13-testing.md           — unit/integration/E2E coverage
14-code-quality.md      — component size, dead code, casts
15-typescript.md        — type safety, casts, non-null assertions
16-react.md             — hooks, effects, cleanup, derived state
17-nextjs.md            — App Router, SEO metadata, proxy matcher
18-tailwind-ui.md       — design system consistency, duplication
19-architecture.md      — feature boundaries, mappers, DX
20-roadmap.md           — dependency matrix, priority matrix, order
```

Dependencies (see `20-roadmap.md` for the full matrix):

- Phase 01 (Security) must land first; it blocks nothing but unblocks safe iteration.
- Phase 05 (Chat) depends on Phase 01 (signed-URL participation check).
- Phase 09 (Performance) depends on Phase 01 (cache must not bypass RLS).
- Phases 02–04, 06–08 can run in parallel with each other.
- Phase 13 (Testing) can run in parallel with all feature phases.
- Phase 20 (Roadmap) is the execution plan for all of the above.

---

## 8. Priority Matrix

| Priority | Problem | Feature | Impact | Effort |
|----------|---------|---------|--------|--------|
| P0 | Verify chat signed-URL participant scope | Chat | Critical | S |
| P0 | Verify all Server Actions re-check ownership | All | Critical | M |
| P1 | Add chat realtime/presence/typing tests | Chat | High | M |
| P1 | Add favorites toggle tests | Favorites | High | S |
| P1 | Add dashboard action tests | Dashboard | High | S |
| P1 | Confirm composite indexes for products query | Products | High | S |
| P2 | `aria-live` on chat message list | Chat | Medium | S |
| P2 | SEO metadata on `/products/[id]` and `/profile/[id]` | Products/Profile | Medium | S |
| P2 | Extract shared empty/error state pattern | UI | Medium | M |
| P3 | Reduce component size >200 lines | Multiple | Low | M |
| P3 | Remove `as unknown as` casts | Products | Low | S |
| P3 | Playwright E2E baseline | All | Low | L |

---

## 9. Recommended Implementation Order

1. **Phase 01** — Security hardening (chat signed URLs, action ownership checks).
2. **Phase 02** — Chat completeness + tests.
3. **Phase 03** — Favorites/dashboard tests (parallel with 02).
4. **Phase 04** — Accessibility pass (parallel with 02/03).
5. **Phase 05** — Performance measurement.
6. **Phase 06** — SEO metadata.
7. **Phase 07** — Code quality refactors.
8. **Phase 08** — Playwright E2E.

Each phase is documented in its own file (`01-*.md` … `21-*.md`).
