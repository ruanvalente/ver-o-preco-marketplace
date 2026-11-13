# Ver-o-Preço --- Listings Architecture

## 1. Purpose

This document describes the `listings` module: how a seller creates, edits,
publishes, pauses and deletes an own listing, and how database and Storage
writes stay consistent.

The public catalog belongs to the `products` module. `listings` owns the
seller's write and lifecycle view, including drafts, storage paths and image
management.

## 2. Scope

Implemented:

- Create listing.
- Edit listing.
- Delete listing.
- Publish and pause.
- Upload up to 8 images.
- Reorder images and choose the primary image.
- Preview before publishing.
- Unsaved-changes warning.
- Error and empty states.

Out of scope for this module:

- Payments, orders, shipping and promoted listings.
- Advanced moderation.
- Ratings or reputation.
- "Mark as sold" (the `sold` status exists in the database and badge, but
  there is no UI action yet).

## 3. Module Layout

```text
src/features/listings/
├── components/
│   ├── listing-form.tsx
│   ├── image-uploader.tsx
│   ├── listing-preview.tsx
│   ├── listings-page.tsx
│   ├── listing-card.tsx
│   ├── listing-status-badge.tsx
│   ├── listing-feedback.tsx
│   ├── listing-empty-state.tsx
│   ├── listing-error-state.tsx
│   └── listing-delete-dialog.tsx
├── hooks/
│   └── use-listing-images.ts
├── schemas/
│   └── listing.schemas.ts
├── services/
│   ├── listing.service.ts
│   ├── listing.actions.ts
│   ├── listing-image.service.ts
│   └── listing-storage.service.ts
├── types/
│   └── listing.types.ts
├── utils/
│   ├── format.ts
│   └── listing-mappers.ts
└── tests/
```

Routes:

```text
src/app/(dashboard)/listings/page.tsx
src/app/(dashboard)/listings/new/page.tsx
src/app/(dashboard)/listings/[id]/edit/page.tsx
```

Every route calls `requireUser` on the server before rendering the module.

## 4. Request Flow

```text
Route (server)
    ↓ requireUser
ListingsPage / ListingForm (domain UI)
    ↓
listing.actions.ts (Server Action)
    ↓ validateListingForm + validateListingImagesForUser
listing.service.ts
    ↓
Supabase (products, product_images, replace_product_images)
```

Browser image uploads are separate from the server action:

```text
ImageUploader
    ↓
use-listing-images (state, object URLs, retry, order, primary)
    ↓ uploadListingImage
listing-storage.service.ts
    ↓
Supabase Storage: product-images/<auth.uid()>/<timestamp>-<id>.<ext>
```

The form sends only `storage_path` values, ordering and alt text. The server
never accepts a file body, a seller id or a status from the client.

## 5. Data Model

`listings` reuses the tables introduced by `migrations/0003_products.sql`:

```text
products
├── id
├── seller_id          → profiles(id)
├── category_id        → categories(id)
├── title
├── description
├── price              numeric(12, 2)
├── condition
├── city
├── neighborhood
├── status             draft | active | paused | sold | removed
├── created_at
└── updated_at

product_images
├── id
├── product_id         → products(id) ON DELETE CASCADE
├── storage_path
├── alt_text
├── sort_order
├── is_primary
└── created_at
```

`migrations/0004_listing_images.sql` adds the atomic image-replacement
function used by the service.

## 6. Status Lifecycle

```text
create             → draft
create + publish   → active
edit + publish     → active
edit (save)        → unchanged
pause              → paused
delete             → row removed
```

Only `active` listings appear in the public marketplace; public queries and
RLS both filter by `status = 'active'`.

The form never sends `status`. It sends an explicit intent:

```text
draft   → new listing saved as draft
save    → existing listing edited without publishing
publish → new or existing listing becomes active
```

`validateListingForm` rejects intents that do not match the form mode
(`draft` on an existing listing, `save` on a new one).

## 7. Ownership and Security

Authorization is enforced in three layers:

1. **Session** — the route and the Server Action call `requireUser`, so
   `userId` always comes from Supabase Auth.
2. **RLS** — `products` and `product_images` policies only allow the seller to
   read and write own rows; Storage policies only allow writes under
   `<auth.uid()>/...`.
3. **Service filters** — every read and mutation also filters by
   `seller_id = userId`, keeping the ownership rule explicit in application
   code.

Additional rules:

- `getListingForOwner` validates the UUID before querying and returns
  `null` for another user's listing, so a non-owner sees the same
  "not found or no permission" message as a missing row.
- `validateListingImagesForUser` rejects paths outside the user's folder,
  `..` traversal, unknown extensions, duplicate paths, missing objects,
  disallowed MIME types and files above 5 MB.
- `replace_product_images` runs with `SECURITY INVOKER` and re-checks
  ownership, so a direct RPC call cannot modify another seller's images.
- The service-role key is never used by this module.

## 8. Image Consistency

Image changes go through `replace_product_images` instead of multiple client
requests. The function deletes and re-inserts `product_images` inside a single
transaction, preserving the partial unique index that allows one primary image
per product.

Normalization rules (mirrored in the schema and the RPC):

- Maximum of 8 images.
- `sort_order` follows the submitted array order.
- Exactly one primary image; the first image is promoted when none is marked.
- Alt text is trimmed and limited to 200 characters; empty becomes `NULL`.

## 9. Partial Failure Handling

The database row is the source of truth.

### Create

1. Insert as `draft` so the public catalog never sees a listing without
   images.
2. Associate images through the RPC.
3. Publish only after images succeed.
4. If the RPC fails, delete the draft row and return an image error. Files
   already uploaded stay in Storage so a retry can reuse them.
5. If publishing fails, keep the draft and return its `listingId` so the user
   can reopen it.

### Edit

1. Update fields.
2. Replace images through the RPC.
3. Remove files that left the set from Storage, only when they belong to the
   user's folder.
4. If the RPC fails, the fields remain saved and the response includes
   `listingId` plus an image-specific message. Storage cleanup is skipped.
5. If Storage cleanup fails after a successful edit, the error is logged and
   the edit still succeeds; the file becomes orphaned.

### Delete

1. Delete the `products` row (images cascade in the database).
2. Remove the user's files from Storage.
3. If Storage cleanup fails, the listing stays deleted and the file becomes
   orphaned.

Orphaned files do not affect correctness and can be cleaned by a future
maintenance job. The alternative — restoring a deleted listing because a file
removal failed — would be worse for the seller.

## 10. Storage

```text
bucket: product-images
path:   <auth.uid()>/<timestamp>-<random>.<ext>
```

- The bucket is public for reads because the catalog is public.
- Writes and deletes are restricted to the user's folder by Storage policies.
- New uploads are deleted immediately if removed before being saved to a
  listing.
- Persisted files are only deleted by the server after image replacement or
  listing deletion succeeds.

## 11. Client State

`useListingImages` owns upload, retry, removal, ordering and primary-image
state. The form derives its payload from images whose status is `ready`.

- Uploads start as soon as files are selected.
- Submission is blocked while an upload is in progress or failed.
- Ordering uses buttons (not drag-and-drop) so it works with keyboard and
  screen readers.
- Persisted images that are removed are recorded in `removedImagePaths`; the
  server recomputes the actual removed paths from the database before touching
  Storage.
- Object URLs are revoked when an upload finishes or the component unmounts.

## 12. Feedback and States

- Successes and failures after a mutation are conveyed through short URL
  parameters (`created`, `updated`, `deleted`, `error`) and translated by
  `ListingFeedback`. Raw Supabase errors are never shown.
- The listings page has explicit empty and error states.
- The form shows inline field errors, focuses the first invalid field and
  warns about unsaved changes with `beforeunload`.
- When fields are saved but images fail, the form links to the saved listing.

## 13. Tests

```text
tests/listing-schemas.test.ts        form, price and file validation
tests/listing-mappers.test.ts        domain mapping
tests/listing-service.test.ts        ownership, CRUD, publish/pause, cleanup
tests/listing-image-service.test.ts  server-side image validation
tests/listing-form.test.tsx          validation, submission, edit mode
tests/image-uploader.test.tsx        accessible uploader interactions
tests/listings-page.test.tsx         empty, error and populated states
```

Run with `bun run test`.

## 14. Known Limitations

- No "mark as sold" action yet.
- No scheduled cleanup for orphaned Storage files.
- The listing form uploads images before the listing exists; a user who
  abandons the form after uploading leaves files in Storage until the
  maintenance job exists.
- Moderation (`removed` status) is not implemented; the listings page hides
  `removed` rows.
