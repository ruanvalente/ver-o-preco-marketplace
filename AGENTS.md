<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Ver-o-Preço Marketplace

## Pacotes e ferramentas
- Usar **bun** para instalação e execução de scripts/pacotes neste projeto (`bun add`, `bunx`, `bun dev`, etc.).
- Preferir Server Components por padrão; usar Client Components apenas quando necessário.
- Seguir estrutura **feature-first** em `src/features/`. Código específico de feature deve ficar no próprio módulo; apenas código realmente compartilhado vai para `src/components/`, `src/lib/`, `src/hooks/` ou `src/types/`.
- Supabase via `@supabase/ssr` com clientes separados para browser/server e middleware para sessão.
- Nunca commitar segredos. Usar `.env.example` para documentar variáveis. Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no browser.
- Design tokens e diretrizes devem seguir `DESIGN.md`. Primitivas em `src/components/ui/`, layout em `src/components/layout/`.
- Qualidade: `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`.

---

## 1. Project Overview

**Ver-o-Preço** is a regional marketplace platform focused initially on Pará, Brazil.

The platform allows users to:

- Browse products without authentication.
- Search and filter products.
- View product details.
- Create an account.
- Authenticate using Supabase Auth.
- Publish products.
- Edit and manage their own listings.
- Favorite products.
- Contact sellers through an internal chat.
- Send text messages and images.
- See seller online/offline status.
- Receive real-time messages.
- Manage their profile and account.

The product is conceptually inspired by marketplaces such as OLX and Mercado Livre, but **must not copy their visual identity, structure, or UX directly**.

The Ver-o-Preço should feel like a:

> Simple, local, modern and trustworthy marketplace.

The initial geographic focus is Pará, especially:

- Belém;
- Ananindeua;
- Marituba;
- Castanhal;
- Santarém.

The architecture must allow expansion to other Brazilian regions in the future.

---

# 2. Core Product Principles

All development decisions must prioritize:

1. Simplicity.
2. Mobile-first UX.
3. Accessibility.
4. Performance.
5. Reusability.
6. Feature isolation.
7. Clear domain boundaries.
8. Type safety.
9. Secure data access.
10. Progressive implementation.
11. Minimal unnecessary dependencies.
12. Maintainability.

Do not implement features merely because they are technically interesting.

Every feature must have a clear product purpose.

---

# 3. Technology Stack

The project should use:

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend / BaaS

- Supabase

Use Supabase for:

- Authentication;
- PostgreSQL database;
- Storage;
- Realtime;
- Row Level Security;
- Database functions when necessary.

### Testing

Prefer:

- Vitest;
- Testing Library;
- Playwright or Cypress for critical E2E flows.

Testing strategy must be defined per feature.

---

# 4. Architecture Principles

The application must be organized around **features/modules**, not around technical layers alone.

Avoid creating a large global structure such as:

```text
components/
services/
hooks/
utils/
types/
```

where all application logic is mixed together.

Prefer:

```text
features/
├── auth/
├── products/
├── listings/
├── favorites/
├── chat/
├── profile/
└── dashboard/
```

Each feature owns its domain-specific:

- Components;
- Hooks;
- Services;
- Schemas;
- Types;
- Validation;
- Tests;
- Utilities.

Shared code should only be extracted when it is genuinely shared.

---

# 5. Recommended Project Structure

Use the following structure as the initial architectural guideline:

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── search/
│   │       └── page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   └── (dashboard)/
│       ├── dashboard/
│       ├── listings/
│       ├── favorites/
│       ├── messages/
│       ├── profile/
│       └── settings/
│
├── components/
│   ├── ui/
│   └── layout/
│
├── features/
│   ├── auth/
│   ├── products/
│   ├── listings/
│   ├── favorites/
│   ├── chat/
│   ├── profile/
│   └── dashboard/
│
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── validations/
│
├── hooks/
│
├── types/
│
└── config/
```

This is a guideline, not an excuse to create empty folders.

Only create directories when there is actual code belonging to them.

---

# 6. Feature / Module Structure

Each feature should follow this general pattern:

```text
features/
└── products/
    ├── components/
    ├── hooks/
    ├── services/
    ├── schemas/
    ├── types/
    ├── utils/
    └── tests/
```

For more complex features, use:

```text
features/
└── chat/
    ├── components/
    │   ├── chat-window/
    │   ├── conversation-list/
    │   ├── message-list/
    │   ├── message-input/
    │   └── typing-indicator/
    │
    ├── hooks/
    │   ├── use-conversations.ts
    │   ├── use-messages.ts
    │   └── use-chat-realtime.ts
    │
    ├── services/
    │   ├── conversations.service.ts
    │   ├── messages.service.ts
    │   └── presence.service.ts
    │
    ├── schemas/
    ├── types/
    ├── utils/
    └── tests/
```

Do not create this entire structure upfront.

Create directories progressively as the feature evolves.

---

# 7. Shared Components

Only truly generic components belong in:

```text
components/ui/
```

Examples:

- Button;
- Input;
- Dialog;
- Drawer;
- Card;
- Badge;
- Avatar;
- Tabs;
- Tooltip;
- Skeleton;
- Toast;
- Dropdown;
- Select.

These should preferably come from or be compatible with shadcn/ui.

Do not put product-specific components inside `components/ui`.

For example:

```text
components/ui/product-card.tsx
```

is incorrect.

Prefer:

```text
features/products/components/product-card.tsx
```

---

# 8. Domain Boundaries

The initial domain modules are:

```text
auth
products
listings
favorites
chat
profile
dashboard
```

### auth

Responsible for:

- Registration;
- Login;
- Logout;
- Password recovery;
- Password reset;
- Session;
- Authentication guards.

### products

Responsible for:

- Product discovery;
- Search;
- Filters;
- Product details;
- Categories.

### listings

Responsible for:

- Creating listings;
- Editing listings;
- Deleting listings;
- Publishing;
- Pausing;
- Marking as sold;
- Product image management.

### favorites

Responsible for:

- Adding favorites;
- Removing favorites;
- Listing favorites.

### chat

Responsible for:

- Conversations;
- Messages;
- Image messages;
- Realtime updates;
- Presence;
- Typing state;
- Read status.

### profile

Responsible for:

- User profile;
- Avatar;
- Contact information;
- Location;
- Account preferences.

### dashboard

Responsible for:

- Overview;
- Metrics;
- Recent listings;
- Recent messages;
- Navigation.

---

# 9. Supabase Architecture

Supabase is the backend foundation of the project.

Use:

### Supabase Auth

For:

- Email/password authentication;
- Email verification;
- Password recovery;
- Password reset;
- Session management.

---

## Database

Initial entities:

```text
profiles
categories
products
product_images
favorites
conversations
conversation_participants
messages
reports
notifications
```

Do not create all tables blindly.

Introduce database entities when their corresponding feature is implemented.

---

# 10. Row Level Security

RLS is mandatory.

Never rely exclusively on frontend authorization.

Examples:

### Products

Public users can:

- Read published products.

Authenticated users can:

- Create products.

Users can:

- Update their own products.
- Delete their own products.

### Favorites

Authenticated users can:

- Create their own favorites.
- Remove their own favorites.
- Read their own favorites.

### Conversations

Only conversation participants can:

- Read the conversation;
- Read messages;
- Send messages.

### Messages

Only participants of the associated conversation can access messages.

---

# 11. Storage

Supabase Storage should be used for:

```text
product-images
avatars
chat-images
```

Storage policies must follow the same authorization model as the database.

Never expose private chat images through unrestricted public buckets.

---

# 12. Realtime

Supabase Realtime should be introduced incrementally.

Initial realtime requirements:

### Chat

- New messages;
- Message updates;
- Read status.

### Presence

- Online/offline state.

### Typing

- Typing indicator.

Do not introduce realtime into areas that do not need it.

---

# 13. Authentication Rules

Public users can:

- Browse products;
- Search;
- Filter;
- Open product details.

Authentication is required for:

- Creating listings;
- Editing listings;
- Favorites;
- Starting conversations;
- Sending messages;
- Sending images;
- Managing profile.

If an unauthenticated user attempts an authenticated action, provide a clear authentication prompt.

Example:

> Entre na sua conta para conversar com este vendedor.

Actions:

- Entrar;
- Criar conta.

---

# 14. Product Listing

A product listing should support:

```text
title
description
price
category
condition
location
contact_phone
contact_email
status
seller_id
created_at
updated_at
```

Possible statuses:

```text
draft
active
paused
sold
removed
```

Do not expose internal database fields directly to UI components.

Use domain types.

---

# 15. Product Images

Listings can contain multiple images.

Requirements:

- Upload multiple images;
- Preview;
- Remove;
- Reorder;
- Define primary image;
- Validate file type;
- Validate file size;
- Upload progress;
- Error handling.

The first image should be treated as the primary image unless the user explicitly changes it.

---

# 16. Chat

Chat is strictly for general questions about listings.

The chat should support:

- Text;
- Images;
- Online status;
- Offline status;
- Typing indicator;
- Read status;
- Unread count.

Each conversation should be associated with a product.

Example:

```text
Buyer
    ↓
Conversation
    ↓
Product
    ↓
Seller
```

A user should not be able to initiate arbitrary conversations without a product context.

---

# 17. Chat UX

The chat interface should contain:

### Conversation list

- Avatar;
- Name;
- Last message;
- Timestamp;
- Unread indicator;
- Online status.

### Chat header

- Seller/buyer avatar;
- Name;
- Online/offline;
- Product preview;
- Link to product.

### Message list

- Sender;
- Text;
- Images;
- Timestamp;
- Read status.

### Message input

- Text input;
- Image upload;
- Send button.

Mobile chat should occupy the available viewport and behave like a native messaging interface.

---

# 18. Design System

The application must maintain a consistent visual system.

Primary inspiration:

### Pará

and

### Açaí

Suggested palette:

```text
Primary:
Deep Amazon Green

Secondary:
Açaí Purple

Background:
Warm / neutral light tones

Foreground:
Dark neutral

Success:
Green

Warning:
Amber

Error:
Red
```

Do not use excessive gradients.

Do not use excessive shadows.

Do not turn every component into a colored card.

The interface should feel modern and mature.

---

# 19. Regional Identity

The regional identity should be subtle.

Use Pará/Amazon-inspired colors and naming.

Do not create caricatures or excessive decorative references.

The application should still look like a professional technology product.

Examples of microcopy:

```text
Encontre o que você precisa.
Venda o que não usa.

Tem algo parado em casa?
Venda no Ver-o-Preço.

Converse com o vendedor.

Encontrou o que procurava?
```

---

# 20. Responsive Design

Mobile-first is mandatory.

Support:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Important mobile requirements:

- Responsive header;
- Search optimized for touch;
- Filter drawer;
- Responsive product grid;
- Mobile dashboard;
- Mobile navigation;
- Full-screen chat;
- Touch-friendly forms;
- Accessible buttons;
- No horizontal overflow.

Never solve responsiveness by simply shrinking desktop layouts.

---

# 21. Accessibility

Follow WCAG principles.

Every feature should consider:

- Keyboard navigation;
- Focus states;
- Semantic HTML;
- Form labels;
- Accessible errors;
- Screen reader support;
- Color contrast;
- Touch target size;
- Loading states;
- Empty states.

Accessibility is part of the feature definition, not a final step.

---

# 22. Performance

Prioritize:

- Server Components where appropriate;
- Optimized images;
- Lazy loading;
- Pagination;
- Query limits;
- Efficient Supabase queries;
- Avoiding unnecessary client components;
- Avoiding unnecessary realtime subscriptions.

Do not load an entire marketplace dataset into the browser.

---

# 23. Validation

Use schema validation where appropriate.

Prefer a consistent validation strategy for:

- Authentication;
- Product creation;
- Product editing;
- Profile;
- Messages.

Validation should happen on both:

- Client;
- Server/backend boundary.

Never trust client-side validation alone.

---

# 24. Error Handling

Every feature must define:

### Loading

Use skeletons or appropriate loading indicators.

### Empty

Provide useful empty states.

### Error

Provide human-readable messages.

### Unauthorized

Redirect or show authentication prompt.

### Forbidden

Show an appropriate authorization message.

### Network failure

Allow retry where possible.

Never expose raw Supabase/database errors directly to users.

---

# 25. Development Workflow

Development must happen incrementally.

Never attempt to implement the entire application in a single step.

Use the following phases.

---

# PHASE 0 — Project Foundation

Goal:

Create a clean and minimal application foundation.

Tasks:

- Initialize Next.js;
- Configure TypeScript;
- Configure Tailwind;
- Configure shadcn/ui;
- Configure linting;
- Configure formatting;
- Configure testing;
- Configure environment variables;
- Configure Supabase client;
- Establish project structure;
- Establish basic layout;
- Establish design tokens;
- Establish base typography.

Deliverable:

A running application with the base architecture.

Do not implement marketplace features yet.

---

# PHASE 1 — Design System

Goal:

Create the visual foundation.

Implement:

- Colors;
- Typography;
- Spacing;
- Radius;
- Shadows;
- Buttons;
- Inputs;
- Cards;
- Badges;
- Avatar;
- Dialog;
- Drawer;
- Toast;
- Skeleton;
- Navigation.

Create:

```text
docs/design/
```

and document important design decisions.

If a `DESIGN.md` exists, it is the source of truth for visual decisions.

Deliverable:

A reusable UI foundation.

---

# PHASE 2 — Authentication Module

Goal:

Implement complete authentication.

Feature:

```text
features/auth/
```

Implement:

- Register;
- Login;
- Logout;
- Forgot password;
- Reset password;
- Session handling;
- Protected routes;
- Authenticated user state.

Supabase Auth must be the source of truth.

Tests:

- Registration;
- Login;
- Invalid credentials;
- Password recovery;
- Protected route;
- Logout.

Deliverable:

A user can create an account, authenticate and recover their password.

---

# PHASE 3 — Profiles Module

Goal:

Create the user profile domain.

Implement:

```text
features/profile/
```

Support:

- Profile creation;
- Name;
- Avatar;
- Phone;
- Location;
- Account information.

Configure:

- Database;
- RLS;
- Storage;
- Validation.

Deliverable:

Authenticated users can manage their profile.

---

# PHASE 4 — Products Module

Goal:

Allow public product discovery.

Implement:

```text
features/products/
```

Features:

- Product listing;
- Product cards;
- Product details;
- Search;
- Categories;
- Filters;
- Sorting;
- Pagination.

Public users must be able to browse without authentication.

Deliverable:

A functional public marketplace catalog.

---

# PHASE 5 — Listings Module

Goal:

Allow authenticated users to sell products.

Implement:

```text
features/listings/
```

Features:

- Create listing;
- Edit listing;
- Delete listing;
- Publish;
- Pause;
- Mark as sold;
- Upload images;
- Reorder images;
- Product preview.

Implement:

- Database;
- RLS;
- Storage;
- Validation.

Deliverable:

An authenticated user can publish and manage their own listings.

---

# PHASE 6 — Favorites Module

Goal:

Allow users to save products.

Implement:

```text
features/favorites/
```

Features:

- Favorite;
- Unfavorite;
- Favorite list;
- Empty state;
- Authentication requirement.

Deliverable:

Users can maintain their own favorite products.

---

# PHASE 7 — Dashboard Module

Goal:

Create the authenticated application experience.

Implement:

```text
features/dashboard/
```

Dashboard should provide:

- Overview;
- Listing metrics;
- Recent listings;
- Recent messages;
- Quick actions.

Navigation:

- Dashboard;
- Explore;
- My listings;
- Favorites;
- Messages;
- Profile;
- Settings.

Deliverable:

A complete authenticated user area.

---

# PHASE 8 — Chat Module

Goal:

Implement buyer/seller communication.

Implement:

```text
features/chat/
```

Features:

- Conversations;
- Messages;
- Product context;
- Text messages;
- Image messages;
- Unread messages;
- Read state;
- Online/offline presence;
- Typing indicator.

Use:

```text
Supabase Realtime
Supabase Storage
```

Deliverable:

Two authenticated users can communicate about a specific product in real time.

---

# PHASE 9 — Notifications

Goal:

Provide useful communication feedback.

Implement:

```text
notifications
```

Initial notification types:

- New message;
- Listing status;
- Important account events.

Avoid building a complex notification center before the basic chat flow works.

---

# PHASE 10 — Security Hardening

Review:

- RLS;
- Storage policies;
- Authentication;
- Authorization;
- Input validation;
- File uploads;
- Chat access;
- Product ownership;
- Server/client boundaries.

Test unauthorized scenarios explicitly.

Examples:

- User A editing User B's listing;
- User A reading User B's conversation;
- Anonymous user creating a listing;
- Anonymous user sending a message;
- User accessing private chat images.

Deliverable:

Security baseline suitable for a real application.

---

# PHASE 11 — Testing

Each feature should contain appropriate tests.

Prioritize critical flows.

### Authentication

- Register;
- Login;
- Logout;
- Password reset.

### Marketplace

- Search;
- Filter;
- Product details.

### Listings

- Create;
- Edit;
- Delete;
- Publish;
- Upload images.

### Favorites

- Add;
- Remove.

### Chat

- Create conversation;
- Send message;
- Receive realtime message;
- Upload image;
- Read state.

Prefer testing user behavior rather than implementation details.

---

# PHASE 12 — Performance and UX Polish

Review:

- Core Web Vitals;
- Image loading;
- Bundle size;
- Server/client boundaries;
- Supabase query performance;
- Loading states;
- Empty states;
- Error states;
- Mobile UX;
- Accessibility.

Do not add new functionality during this phase unless required to fix UX problems.

---

# PHASE 13 — Production Readiness

Before considering the MVP complete, verify:

- Environment variables;
- Database migrations;
- RLS;
- Storage policies;
- Authentication;
- Error handling;
- Logging;
- Tests;
- Build;
- Type checking;
- Linting;
- Responsive behavior;
- Accessibility;
- Security.

The production build must succeed without warnings that indicate architectural problems.

---

# 26. Feature Development Protocol

Whenever implementing a feature, follow this order:

```text
1. Understand the requirement
2. Identify the domain/module
3. Inspect existing architecture
4. Identify reusable components
5. Define data requirements
6. Define Supabase changes
7. Define authorization/RLS
8. Define UI states
9. Define validation
10. Implement
11. Add tests
12. Run type checking
13. Run lint
14. Run tests
15. Review responsive behavior
16. Review accessibility
17. Review security
```

Do not immediately start coding after receiving a feature request.

First determine where the feature belongs.

---

# 27. Planning

For non-trivial features, create a plan before implementation.

Use:

```text
docs/plans/
```

Example:

```text
docs/plans/
├── 001-foundation.md
├── 002-auth.md
├── 003-products.md
├── 004-listings.md
├── 005-favorites.md
└── 006-chat.md
```

Each plan should describe:

- Objective;
- Scope;
- Non-goals;
- Architecture;
- Data model;
- UI;
- States;
- Security;
- Tests;
- Acceptance criteria.

---

# 28. Acceptance Criteria

Every feature must have explicit acceptance criteria.

Example:

### Product Listing

```text
Given an authenticated user
When they publish a valid product
Then the product should become visible in the public marketplace.

Given an unauthenticated user
When they access the marketplace
Then they should be able to see published products.

Given a user viewing another user's product
When they click "Conversar"
Then they should be prompted to authenticate if necessary.

Given a user attempting to edit another user's product
Then the request must be rejected by backend authorization.
```

Prefer BDD-style criteria for important flows.

---

# 29. Database Development

Database changes must be versioned through migrations.

Do not manually modify production schemas without migrations.

When creating a table:

1. Define the table.
2. Define relationships.
3. Define indexes.
4. Define constraints.
5. Define RLS policies.
6. Define storage policies if applicable.
7. Define seed data if necessary.
8. Test authorization.

Avoid premature database normalization when it adds complexity without product value.

---

# 30. Supabase Client Rules

Keep Supabase access isolated.

Do not instantiate Supabase clients randomly inside components.

Prefer dedicated infrastructure under:

```text
lib/supabase/
```

and feature-specific services under:

```text
features/<feature>/services/
```

Components should not contain large database queries.

Bad:

```tsx
<ProductPage>// 150 lines of Supabase queries</ProductPage>
```

Prefer:

```text
ProductPage
    ↓
Product feature
    ↓
Product service
    ↓
Supabase
```

---

# 31. Server vs Client Components

Prefer Server Components by default.

Use Client Components only when required for:

- Interactivity;
- Browser APIs;
- Local state;
- Realtime subscriptions;
- Event handlers.

Do not mark entire pages as `"use client"` without a clear reason.

---

# 32. State Management

Do not introduce global state management prematurely.

Prefer:

1. Server state;
2. URL state;
3. Local component state;
4. React context when appropriate.

Only introduce a state management library if the actual application complexity justifies it.

---

# 33. Search and Filters

Search state should preferably be represented in URL parameters.

Example:

```text
/products?
q=iphone
&category=electronics
&minPrice=1000
&maxPrice=5000
&sort=recent
```

This allows:

- Shareable URLs;
- Browser navigation;
- Server-side rendering;
- Better SEO.

---

# 34. SEO

Public marketplace pages should be SEO-friendly.

Prioritize:

- Product metadata;
- Open Graph;
- Semantic HTML;
- Dynamic metadata;
- Crawlable public product pages;
- Proper URLs.

Authenticated areas do not require SEO optimization.

---

# 35. Security Principles

Never trust:

- Client input;
- Client roles;
- Client ownership;
- Client prices;
- Client user IDs;
- Client authorization state.

Authorization must be enforced server-side and/or through Supabase RLS.

Never expose:

- Service role keys;
- Private storage credentials;
- Sensitive user information.

Never use the Supabase service role key in browser code.

---

# 36. Privacy

Avoid unnecessarily exposing:

- Seller email;
- Seller phone;
- Internal user IDs;
- Private conversations;
- Private images.

The chat should be the preferred contact mechanism.

Contact information should only be displayed according to the product's privacy requirements.

---

# 37. MVP Scope

The first MVP should focus on:

```text
Authentication
+
Profiles
+
Product discovery
+
Product details
+
Create listing
+
Manage listing
+
Favorites
+
Chat
+
Realtime
```

Do not implement initially:

- Payments;
- Shipping;
- Escrow;
- Complex seller ratings;
- Delivery tracking;
- Ads;
- Subscription plans;
- Advanced recommendation engine;
- AI recommendations.

Those can be future modules.

---

# 38. Future Modules

Potential future modules:

```text
reviews/
payments/
orders/
shipping/
notifications/
moderation/
reports/
analytics/
recommendations/
admin/
subscriptions/
```

These should not contaminate the MVP architecture.

The current architecture should simply leave room for them.

---

# 39. Code Quality

Prefer:

- Small components;
- Explicit types;
- Clear naming;
- Composition;
- Reusable primitives;
- Feature ownership;
- Simple abstractions.

Avoid:

- Premature abstraction;
- Giant components;
- Generic utilities without reuse;
- Deep prop drilling;
- Duplicate business rules;
- Business logic inside UI components;
- Unnecessary dependencies.

---

# 40. Definition of Done

A feature is not complete when the UI works.

A feature is complete when:

```text
[ ] Requirement implemented
[ ] Correct feature/module boundary
[ ] UI implemented
[ ] Responsive behavior verified
[ ] Loading state implemented
[ ] Empty state implemented
[ ] Error state implemented
[ ] Validation implemented
[ ] Supabase integration implemented
[ ] RLS reviewed
[ ] Storage policies reviewed if applicable
[ ] Accessibility reviewed
[ ] Tests implemented
[ ] TypeScript passes
[ ] Lint passes
[ ] Build passes
[ ] Security reviewed
[ ] Documentation updated
```

---

# 41. Agent Behavior

When working on this repository:

### Do

- Inspect existing code before modifying it.
- Follow existing conventions.
- Reuse existing components.
- Keep changes scoped.
- Prefer incremental implementation.
- Create plans for complex work.
- Consider mobile behavior.
- Consider accessibility.
- Consider security.
- Test critical flows.
- Explain architectural tradeoffs.

### Do not

- Rewrite unrelated code.
- Introduce dependencies without justification.
- Move files unnecessarily.
- Create abstractions prematurely.
- Disable lint rules to make code pass.
- Disable TypeScript checks.
- Bypass RLS.
- Use service-role credentials in client code.
- Implement multiple unrelated features in one change.
- Replace existing architecture without understanding it.

---

# 42. Task Execution Format

When receiving a development task, follow:

```text
## Analysis

Understand the requirement and identify the feature/module.

## Plan

Define the smallest implementation that satisfies the requirement.

## Implementation

Implement the feature incrementally.

## Validation

Run:

- TypeScript
- Lint
- Tests
- Build when appropriate

## Review

Check:

- UX
- Responsive behavior
- Accessibility
- Security
- Architecture

## Summary

Explain:

- What changed;
- Files/modules affected;
- Database changes;
- Tests;
- Remaining limitations.
```

---

# 43. Source of Truth

When there is a conflict, use the following priority:

```text
1. Explicit user requirement
2. Security requirements
3. Existing architectural decisions
4. DESIGN.md
5. AGENTS.md
6. Feature plan
7. Existing implementation conventions
```

Do not make large architectural decisions silently.

When a decision affects multiple modules, document it.

---

# 44. Final Architectural Principle

The Ver-o-Preço must evolve as a collection of independent but cohesive features.

The preferred mental model is:

```text
VER-O-PREÇO
│
├── Auth
│
├── Profile
│
├── Products
│
├── Listings
│
├── Favorites
│
├── Chat
│
├── Dashboard
│
└── Future Modules
```

Each module should own its business rules.

The application shell should compose those modules rather than contain their business logic.

The goal is not to build the largest marketplace possible.

The goal is to build a **small, maintainable and extensible marketplace with a strong regional identity**, using modern frontend architecture and Supabase as the backend platform.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
