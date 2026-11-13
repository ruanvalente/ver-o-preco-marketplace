# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two sides of one regional marketplace in Pará, Brazil.

- **Sellers — the acquisition audience.** Individuals with idle items at home who want to sell locally without paying a commission. Often occasional or first-time sellers, usually on a phone.
- **Buyers — the usage base.** People in the same municipality or neighborhood looking for used and second-hand goods close to home, often browsing without an account.

Public visitors browse, search, filter and open listings and seller profiles without authenticating. An account is required to publish and manage listings, favorite products, start conversations, send messages and manage a profile.

## Product Purpose

Ver-o-Preço lets people in Pará buy and sell used goods near them, negotiate directly, and keep personal contact details private. It exists so a seller keeps the full value of the sale and a buyer finds something useful close by, without scattered WhatsApp groups or distant national marketplaces. Success means a person in Pará can list an item in minutes, be found by people nearby, and close the deal through the platform's own chat.

## Positioning

The seller keeps 100% of the sale — Ver-o-Preço charges no commission on transactions — and the negotiation happens inside the platform, organized by municipality, with phone and email kept out of the listing. National marketplaces take a cut and treat the region as a distant postcode; informal groups have reach but no structure, history or privacy.

## Operating Context

- Interface and content in Brazilian Portuguese; prices in BRL; dates and locations in Brazilian format.
- Initial geographic focus: Belém, Ananindeua, Marituba, Castanhal and Santarém, with other Pará municipalities supported. Expansion to other Brazilian regions is a future possibility, not a current commitment.
- Deals close in person between buyer and seller. There is no shipping, payment or escrow in the MVP.
- The phone is the primary device; desktop is an enhancement, never the reference layout.
- Backend is Supabase (Auth, PostgreSQL, Storage, Realtime) with row-level security as the authorization boundary.
- Stack: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui primitives, Vitest and Testing Library; bun runs scripts and packages. Product code lives in `src/features/<feature>/`.

## Capabilities and Constraints

Shipped or in progress:

- Public catalog: browse, search, category/price/condition/location filters, sorting, pagination, product detail, public seller profile.
- Accounts: email/password registration, login, logout, password recovery and reset, session handling, protected routes.
- Profile: display name, avatar, phone, location.
- Listings: create, edit, delete, publish, pause, mark as sold; multiple images with primary image, reordering and removal; validation on client and server.
- Favorites: add and remove products, and view the user's saved products in a protected favorites list.
- Dashboard: minimal authenticated shell today; the full overview, metrics and quick actions are planned.

Committed for the MVP but not yet implemented:

- In-platform chat tied to a listing: text and image messages, conversation list, read state, unread count, online status, typing indicator, Supabase Realtime.
- The complete dashboard.

Deliberately out of MVP scope: payments, shipping, escrow, reviews and seller ratings, delivery tracking, ads, subscription plans, recommendation engines, moderation and reporting, admin.

Rules future work must keep:

- Authorization is enforced server-side and through RLS, never by client state. Service-role credentials never reach the browser.
- Validation happens on both the client and the server boundary; raw database errors never surface to users.
- Chat is the preferred contact mechanism; seller email and phone are not displayed by default on listings.
- Every feature owns its business rules inside its module; shared code is extracted only when genuinely shared.
- UI terminology: "anúncio" for a listing, "anunciar produto", "conversar com vendedor". No technical or English jargon in user-facing copy.

Open decisions:

- Revenue beyond the durable no-commission promise (optional services, promoted listings or advertising) is undecided.
- Whether seller verification, ratings or trust badges will exist is undecided; nothing may imply verification before a real system exists.

## Brand Commitments

- Name: **Ver-o-Preço**, a tribute to Belém's Ver-o-Peso market adapted with "preço". Presented as a modern technology brand, not a literal depiction of the market.
- Regional identity is subtle: Pará and açaí references live in color, naming, microcopy and photography, never as caricature or decoration.
- Voice: local, friendly, reliable, modern, practical and human — never corporate-cold, luxurious, childish or noisy.
- Anti-reference: OLX and Mercado Livre are conceptual inspiration only. Their visual identity, layouts, components, copy and interaction patterns must not be reproduced.
- "Taxa zero" and "sem comissão sobre a venda" are a durable promise, not launch copy.

## Evidence on Hand

- `AGENTS.md` — product specification, domain boundaries, phases and acceptance criteria.
- `DESIGN.md` — visual and interaction source of truth; `docs/design/` documents tokens and components.
- `docs/architecture/` and `docs/plans/` — architecture and phase execution records.
- `migrations/0001`–`0004` and `seeds/0001_products.sql` — current schema and seeded catalog data.
- `src/features/landing/data/landing-content.ts` — landing narrative and proof claims.
- `public/products/*` — placeholder product imagery used by seeds and tests.

Absences future work must not fabricate: there are no real customers, testimonials, press mentions, usage benchmarks, partnerships or seller verification data. The landing page currently marks the chat as "Disponível" although the module does not exist yet; chat is MVP-committed, and that badge is aspirational until it ships.

## Product Principles

1. **The seller never pays to sell.** No commission on transactions, ever; revenue comes from elsewhere.
2. **Negotiation belongs inside the platform.** Private contact details stay private and the conversation keeps its history.
3. **Near is the filter that matters.** Municipality and neighborhood beat national reach.
4. **Phone first, genuinely.** Mobile is the reference experience; desktop enhances it.
5. **Simple before complete.** Ship the smallest useful flow; no feature without a product purpose.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Keyboard navigation, visible focus, semantic HTML, screen-reader labels, accessible form errors, touch targets around 44×44px, states never conveyed by color alone, and respect for `prefers-reduced-motion`. Accessibility is part of each feature's definition, not a final pass.
