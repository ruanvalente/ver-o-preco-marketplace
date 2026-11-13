# Ver-o-Preço --- Architecture Overview

## 1. Purpose

This document describes the high-level architecture of the Ver-o-Preço
marketplace.

Ver-o-Preço is a regional marketplace initially focused on Pará, Brazil. The
platform allows users to browse products publicly and, after
authentication, publish listings, manage favorites, and communicate with
sellers through real-time chat.

The architecture is designed around **feature/module boundaries**, with
each domain owning its business rules and implementation details.

## 2. Architectural Goals

The architecture must prioritize:

- Clear feature boundaries.
- Maintainability.
- Type safety.
- Mobile-first development.
- Accessibility.
- Performance.
- Secure authorization.
- Reusable UI primitives.
- Incremental development.
- Minimal coupling between modules.

The application should remain simple enough for an MVP while allowing
future modules such as payments, orders, shipping, moderation, and
analytics.

## 3. Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime
- Row Level Security (RLS)

### Testing

- Vitest
- Testing Library
- Playwright or Cypress for critical end-to-end flows

## 4. High-Level Architecture

```text
┌─────────────────────────────────────────────┐
│                  Next.js                    │
│                                             │
│  Public Routes       Authenticated Routes   │
│       │                       │             │
│       └───────────┬───────────┘             │
│                   │                         │
│             Feature Modules                 │
│                   │                         │
│     ┌─────────────┼─────────────┐           │
│     │             │             │           │
│    Auth        Products       Listings      │
│     │             │             │           │
│     │         Favorites       Chat          │
│     │             │             │           │
│     └─────────────┴─────────────┘           │
│                   │                         │
│              Shared UI                      │
│                   │                         │
└───────────────────┼─────────────────────────┘
                    │
                    ▼
             ┌──────────────┐
             │   Supabase   │
             ├──────────────┤
             │ Auth         │
             │ PostgreSQL   │
             │ Storage      │
             │ Realtime     │
             └──────────────┘
```

## 5. Application Layers

The application is conceptually divided into:

### App Layer

Responsible for:

- Routes.
- Layouts.
- Metadata.
- Route-level loading and error states.
- Composition of features.

### Feature Layer

Responsible for:

- Domain-specific UI.
- Business rules.
- Hooks.
- Services.
- Validation.
- Domain types.
- Feature tests.

### Shared UI Layer

Responsible for reusable visual primitives:

- Button.
- Input.
- Card.
- Dialog.
- Drawer.
- Badge.
- Avatar.
- Skeleton.
- Toast.
- Navigation primitives.

### Infrastructure Layer

Responsible for:

- Supabase clients.
- Environment configuration.
- Shared utilities.
- External integrations.

## 6. Feature-First Architecture

The primary organizational unit is the feature/module.

```text
src/features/
├── auth/
├── profile/
├── products/
├── listings/
├── favorites/
├── chat/
└── dashboard/
```

A feature owns its domain logic.

For example:

```text
features/products/
├── components/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
└── tests/
```

Do not move feature-specific code into global folders simply because it
is reusable once. Extract code only when there is a real shared use
case.

## 7. Route and Feature Relationship

Routes compose features; they should not own large amounts of business
logic.

Example:

```text
/products/[id]
        │
        ▼
ProductDetailsPage
        │
        ├── ProductGallery
        ├── ProductInformation
        ├── SellerCard
        └── StartConversationButton
                         │
                         ▼
                    Chat Module
```

## 8. Server and Client Components

Use Next.js Server Components by default.

Client Components should be introduced only when required for:

- Local state.
- Event handlers.
- Browser APIs.
- Realtime subscriptions.
- Interactive UI.

Avoid marking entire routes as client components unnecessarily.

## 9. Public vs Authenticated Areas

### Public

Users can:

- Browse products.
- Search.
- Filter.
- View product details.

### Authenticated

Users can:

- Publish listings.
- Manage their listings.
- Favorite products.
- Start conversations.
- Send messages.
- Manage their profile.

Backend authorization must always enforce these rules independently of
the frontend.

## 10. Data Flow

The preferred flow is:

```text
UI
 ↓
Feature Hook / Server Action
 ↓
Feature Service
 ↓
Supabase
 ↓
PostgreSQL / Storage / Realtime
```

Components should not contain large database operations.

## 11. Non-Goals

The initial architecture does not include:

- Payments.
- Orders.
- Shipping.
- Escrow.
- Subscriptions.
- Advanced recommendations.
- Complex seller ratings.

These may become independent future modules.

## 12. Architectural Principle

Ver-o-Preço should evolve as a collection of cohesive modules rather than as
a monolithic application.

Each module should be independently understandable, testable, and
maintainable while sharing the same application shell and design system.
