# Ver-o-Preço --- Supabase Architecture

## 1. Purpose

This document defines how Supabase is used as the backend platform for
Ver-o-Preço.

Supabase provides:

- Authentication.
- PostgreSQL.
- Storage.
- Realtime.
- Row Level Security.

The frontend must treat Supabase as an infrastructure layer, not as a
replacement for domain boundaries.

## 2. Supabase Components

```text
Supabase
├── Auth
├── PostgreSQL
├── Storage
├── Realtime
└── RLS
```

## 3. Authentication

Use Supabase Auth for:

- Email/password registration.
- Login.
- Logout.
- Password recovery.
- Password reset.
- Session management.

The frontend must never implement its own authentication system.

### 3.1 Auth implementation

The auth module lives in `src/features/auth/` and follows these decisions:

- Credentials are submitted through Server Actions and validated on both the
  client (inline feedback) and the server (source of truth).
- Supabase sessions are refreshed in `proxy.ts` (Next.js 16 replaced
  `middleware.ts` with `proxy.ts`). Protected pages also call `requireUser`
  on the server, so route protection never depends only on the proxy.
- E-mail confirmation and password recovery links land on
  `/auth/callback`, which exchanges the PKCE code for a session.
- Registration sends `display_name` as user metadata. The `profiles` table
  remains owned by the `profile` module.
- Password reset requires the temporary session created by the recovery
  link; without it, the reset page shows an expired-link state.

Supabase Dashboard → Authentication → URL Configuration must include:

```text
Site URL:      <NEXT_PUBLIC_SITE_URL>
Redirect URLs: <NEXT_PUBLIC_SITE_URL>/auth/callback
```

`NEXT_PUBLIC_SITE_URL` is optional in local development; when it is not
set, the request host is used to build the redirect links.

## 4. Profiles

Supabase Auth manages authentication identities.

Application-specific user information belongs in:

```text
profiles
```

Suggested fields:

```text
id
display_name
avatar_path
phone
location
created_at
updated_at
```

The profile ID should reference the authenticated user's ID.

## 5. Database Entities

Initial database entities:

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

Do not create all entities before the corresponding feature requires
them.

## 6. Products

Implemented in `migrations/0003_products.sql` as the public read domain.
Listing creation and seller mutations belong to the `listings` module, documented
in [listings.md](./listings.md).

```text
products
├── id
├── seller_id          → profiles(id)
├── category_id        → categories(id)
├── title
├── description
├── price              numeric(12, 2)
├── condition          new | like_new | excellent | good
├── city
├── neighborhood       nullable
├── status             draft | active | paused | sold | removed
├── created_at
└── updated_at
```

`city` and `neighborhood` are stored separately; the UI renders
`City - Neighborhood`. Contact phone/e-mail are intentionally not part of the
public read model — contact happens through chat.

`categories` holds the reference data (`slug`, `name`, `sort_order`) and is
publicly readable. `category_listing_counts` is a `security_invoker` view that
exposes active product counts per category, so the catalog never fetches every
product to render a badge.

## 7. Product Status

```text
draft
active
paused
sold
removed
```

Only `active` products appear in the public marketplace. Public queries always
filter by `status = 'active'`; RLS enforces the same rule server-side, so the
status sent by a client is never trusted.

## 8. Product Images

Use:

```text
product_images
├── id
├── product_id         → products(id) ON DELETE CASCADE
├── storage_path
├── alt_text
├── sort_order
├── is_primary
└── created_at
```

Images live in the public `product-images` bucket. Uploads are restricted to
the seller's own folder (`<auth.uid()>/...`); reads are public because the
catalog is public. A partial unique index guarantees at most one primary image
per product.

Image sets are replaced through `replace_product_images(UUID, JSONB)` from
`migrations/0004_listing_images.sql`. The function runs as
`SECURITY INVOKER`, re-checks ownership and replaces delete/insert inside a
single transaction, so the listing never reaches a state without a primary
image. The listings service validates uploaded paths and files before calling
it; see [listings.md](./listings.md).

### Applying the products schema

```bash
# Apply the schema with the Supabase SQL editor or psql.
psql "$DATABASE_URL" -f migrations/0003_products.sql

# Listings image replacement (after 0003).
psql "$DATABASE_URL" -f migrations/0004_listing_images.sql

# Favorites (after 0004).
psql "$DATABASE_URL" -f migrations/0005_favorites.sql

# Development seed (requires at least one profile).
psql "$DATABASE_URL" -f seeds/0001_products.sql
```

The seed is idempotent and attaches demo listings to the oldest profile. It
uses local images under `public/products/` so the catalog works without
uploading files to Storage.

## 9. Storage

Initial storage areas:

```text
product-images
avatars
chat-images
```

### Product Images

Used by public listings.

### Avatars

Used by profiles and seller information.

### Chat Images

Must be protected according to conversation membership.

Do not make private chat images publicly accessible by default.

## 10. Row Level Security

RLS is mandatory.

The frontend must never be considered the final authorization layer.

### Profiles

Users can update their own profile.

Users should only access profile fields intended to be public.

### Products

Public users can read active products.

Authenticated users can create products.

Users can update and delete only products where:

```text
products.seller_id = auth.uid()
```

### Favorites

The `favorites` table stores a unique `(user_id, product_id)` pair and its
creation time. Users can only read and delete their own records; inserts must
belong to the authenticated user and reference an active product. The feature
loads favorite product IDs in one query per displayed group, and the favorites
page joins only active public products.

### Conversations

Users can only access conversations where they are participants.

### Messages

Users can only access messages belonging to conversations in which they
participate.

## 11. Realtime

Supabase Realtime should be used for:

### Chat

- New messages.
- Message updates.
- Read status.

### Presence

- Online/offline state.

### Typing

Typing indicators can use realtime presence/broadcast mechanisms rather
than persistent database records.

Do not persist transient typing state unless there is a clear
requirement.

## 12. Conversation Model

A conversation should have a product context.

Conceptually:

```text
products
   │
   ▼
conversations
   │
   ├── buyer
   ├── seller
   │
   ▼
messages
```

Suggested entities:

```text
conversations
conversation_participants
messages
```

A conversation should not exist independently from its product context
in the MVP.

## 13. Message Model

Suggested fields:

```text
messages
├── id
├── conversation_id
├── sender_id
├── message_type
├── content
├── attachment_path
├── created_at
└── read_at
```

Possible message types:

```text
text
image
```

Additional types can be added later.

## 14. File Upload Security

Validate uploads before storing them.

Consider:

- MIME type.
- File extension.
- Maximum size.
- Image dimensions.
- Upload ownership.
- Storage policy.

Never trust a file extension supplied by the client.

## 15. Database Access Pattern

Avoid putting large Supabase queries directly inside UI components.

Preferred:

```text
Component
    ↓
Hook / Server Action
    ↓
Feature Service
    ↓
Supabase
```

Example:

```text
ProductPage
    ↓
useProduct()
    ↓
products.service.ts
    ↓
Supabase
```

## 16. Server and Browser Clients

Use the correct Supabase client depending on execution context.

Browser interactions should use the browser-safe client.

Server-side operations should use the server-compatible client.

The Supabase service-role key must never be exposed to browser code.

## 17. Environment Variables

Only public configuration may use client-exposed variables.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to the browser.

Environment configuration should be centralized and validated.

## 18. Migrations

All schema changes must be versioned.

Use migrations for:

- Tables.
- Columns.
- Indexes.
- Constraints.
- RLS policies.
- Functions.
- Triggers.

Never depend on undocumented manual dashboard changes for
application-critical schema.

## 19. Indexing

Add indexes based on real query patterns.

Likely candidates include:

```text
products.status
products.category_id
products.seller_id
products.created_at
favorites.user_id
messages.conversation_id
messages.created_at
conversation_participants.user_id
```

Do not add indexes blindly.

Review query plans as the dataset grows.

## 20. Search

The initial implementation can use PostgreSQL capabilities appropriate
to the MVP.

Search should support:

- Product title.
- Description where appropriate.
- Category.
- Price.
- Location.

Search parameters should preferably be represented in the URL.

Example:

```text
/products?q=iphone&category=electronics&sort=recent
```

For larger datasets, evaluate PostgreSQL full-text search or a dedicated
search solution.

## 21. Pagination

Never fetch the entire marketplace dataset.

Use pagination or another bounded query strategy.

Product listings should have:

- Explicit page size.
- Stable ordering.
- Appropriate indexes.

## 22. Realtime Subscription Rules

Realtime subscriptions must be scoped narrowly.

Do not subscribe an entire application to all messages.

Example:

```text
Current conversation
        ↓
Subscribe only to relevant events
```

Unsubscribe when the component or route no longer requires the
subscription.

## 23. Security Checklist

Before considering Supabase integration complete:

```text
[ ] Auth configured
[ ] Profiles protected
[ ] Product RLS configured
[ ] Listing ownership enforced
[ ] Favorites protected
[ ] Conversations protected
[ ] Messages protected
[ ] Storage policies configured
[ ] Chat images protected
[ ] Service role key not exposed
[ ] Upload validation implemented
[ ] Database migrations versioned
[ ] Sensitive fields reviewed
```

## 24. Development Order

Supabase implementation should follow the application phases:

```text
Foundation
    ↓
Auth
    ↓
Profiles
    ↓
Products
    ↓
Listings
    ↓
Favorites
    ↓
Chat
    ↓
Notifications
    ↓
Security hardening
```

Do not build the entire database schema before implementing the
corresponding modules.

## 25. Guiding Principle

Supabase should provide reliable infrastructure while the application
retains clear domain boundaries.

The frontend should not become a collection of arbitrary Supabase
queries.

Database access, authorization, storage and realtime behavior must
remain understandable, testable and aligned with the feature/module
architecture.
