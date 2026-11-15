# Ver-o-Preço --- Modules Architecture

## 1. Purpose

This document defines the responsibilities and boundaries of the Ver-o-Preço
application modules.

The project follows a **feature/module-first architecture**.

Each module should own its business logic and domain-specific UI.

## 2. Core Modules

```text
auth
profile
products
listings
favorites
chat
dashboard
```

## 3. Auth Module

Path:

```text
src/features/auth/
```

### Responsibilities

- User registration.
- Login.
- Logout.
- Password recovery.
- Password reset.
- Session handling.
- Authentication state.
- Protected route behavior.

### Does Not Own

- Product authorization.
- Listing ownership.
- Chat permissions.

Those rules belong to their respective domains and backend policies.

### Suggested Structure

```text
auth/
├── components/
├── hooks/
├── services/
├── schemas/
├── types/
└── tests/
```

## 4. Profile Module

Path:

```text
src/features/profile/
```

### Responsibilities

- User profile.
- Display name.
- Avatar.
- Phone.
- Location.
- Profile settings.

### Data

Primary entity:

```text
profiles
```

### Storage

Profile avatars should use Supabase Storage.

## 5. Products Module

Path:

```text
src/features/products/
```

### Responsibilities

- Public product catalog.
- Product search.
- Categories.
- Filters.
- Sorting.
- Pagination.
- Product details.
- Seller summary.

### Public Access

Published products are publicly readable.

### Suggested Components

```text
ProductCard
ProductGrid
ProductGallery
ProductInformation
ProductFilters
ProductSearch
ProductSort
SellerSummary
```

## 6. Listings Module

Path:

```text
src/features/listings/
```

### Responsibilities

- Create listing.
- Edit listing.
- Delete listing.
- Publish listing.
- Pause listing.
- Mark listing as sold.
- Upload product images.
- Reorder images.
- Listing preview.

### Ownership

A user can only modify listings they own.

This must be enforced by Supabase RLS.

### Implementation

The module is implemented in `src/features/listings/`; flow, consistency rules,
RLS and Storage policies are documented in
[listings.md](./listings.md). The `sold` status is reserved — there is no
"mark as sold" action yet.

### Suggested Components

```text
ListingForm
ListingImageUploader
ListingImageGrid
ListingPreview
ListingStatusBadge
MyListingCard
```

## 7. Favorites Module

Path:

```text
src/features/favorites/
```

### Responsibilities

- Add favorite.
- Remove favorite.
- List favorites.
- Favorite state.

### Entity

```text
favorites
```

### Authorization

A user can only manage their own favorites.

## 8. Chat Module

Path:

```text
src/features/chat/
```

### Responsibilities

- Conversations.
- Conversation participants.
- Messages.
- Product context.
- Text messages.
- Image messages.
- Online/offline presence.
- Typing indicator.
- Read state.
- Unread count.
- Realtime subscriptions.

### Suggested Structure

```text
chat/
├── components/
│   ├── chat-window/
│   ├── conversation-list/
│   ├── conversation-item/
│   ├── message-list/
│   ├── message-bubble/
│   ├── message-input/
│   ├── image-message/
│   └── typing-indicator/
├── hooks/
├── services/
├── schemas/
├── types/
└── tests/
```

### Important Rule

A conversation should be associated with a product.

The chat exists primarily to allow buyers and sellers to discuss a
listing.

## 9. Dashboard Module

Path:

```text
src/features/dashboard/
```

### Responsibilities

- Dashboard overview.
- Listing summary.
- Basic metrics.
- Recent listings.
- Recent conversations.
- Quick actions.

The dashboard should compose other modules rather than duplicate their
business logic.

For example:

```text
Dashboard
 ├── ListingsSummary → Listings module
 ├── RecentMessages → Chat module
 └── FavoritesSummary → Favorites module
```

The authenticated `/dashboard` route uses the shared marketplace header and
loads seller profile, listing counts/page data, and chat activity on the
server. Listing filters and pagination are URL-backed; seller queries include
an explicit `seller_id` filter in addition to RLS. Listing status changes reuse
the listings module's owner-checked actions.

The current schema does not record product views, response rates, monthly
history, seller verification, or ratings. The dashboard must label those
indicators unavailable rather than infer or fabricate them. Promoted listings
are outside the MVP; resource cards should link only to existing functionality.

## 10. Module Dependency Rules

Prefer dependencies in this direction:

```text
App Routes
    ↓
Features
    ↓
Infrastructure
```

Features may consume shared UI primitives.

Avoid direct feature-to-feature coupling when possible.

Example:

The product details page may trigger a chat action, but the Products
module should not contain Chat business logic.

Prefer an explicit integration boundary:

```text
Products
    │
    └── StartConversation
              │
              ▼
           Chat
```

## 11. Shared Components

Global components belong to:

```text
src/components/ui/
```

Only generic components should live there.

Examples:

- Button.
- Input.
- Dialog.
- Drawer.
- Card.
- Badge.
- Avatar.
- Skeleton.
- Toast.

Feature-specific components stay inside their feature.

Incorrect:

```text
src/components/ui/ProductCard.tsx
```

Preferred:

```text
src/features/products/components/ProductCard.tsx
```

## 12. Shared Hooks

Do not create a global hooks directory by default.

If a hook belongs to a feature:

```text
features/products/hooks/
```

Only genuinely cross-cutting hooks should be promoted to:

```text
src/hooks/
```

## 13. Shared Types

Avoid creating a giant global type file.

Prefer:

```text
features/products/types/
features/chat/types/
features/listings/types/
```

Global types should be reserved for types that truly cross multiple
domains.

## 14. Module Development Lifecycle

Every new module should follow:

```text
Requirement
    ↓
Domain definition
    ↓
Data model
    ↓
Authorization
    ↓
UI states
    ↓
Implementation
    ↓
Tests
    ↓
Integration
```

## 15. Future Modules

Possible future modules:

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

Future modules should be introduced independently instead of adding
unrelated logic to existing modules.
