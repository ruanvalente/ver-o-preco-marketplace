# ADR-0002: Negotiation happens inside the platform

## Status

Accepted

## Date

2026-11-17

## Context

Deals close in person between people in the same municipality. If contact details are published on listings, the conversation moves to WhatsApp or calls, the platform loses its history, and sellers — often first-time users — expose their phone and email to strangers browsing publicly.

## Decision

Negotiation stays in the platform's own chat. Seller email and phone are private by default and are not displayed on listings. Chat is the preferred contact mechanism, with listing-scoped conversations, message history, read state and private image storage.

## Alternatives Considered

### Show seller phone/email on the listing
- Pros: simplest implementation; immediate contact.
- Cons: privacy loss, no history on the platform, unmoderated off-platform interaction.
- Rejected: contradicts the privacy and trust commitments in `PRODUCT.md`.

### Redirect to WhatsApp from the chat
- Pros: users already know the app.
- Cons: same loss of history and privacy; makes the chat a decorative layer.
- Rejected: the conversation is the product's organizing structure.

## Consequences

- Chat is a critical flow, not a secondary feature: it needs RLS, participant checks, Realtime and private Storage from the start.
- The seller's contact details may only be shared through an explicit, future product decision.
- `features/chat/` owns these rules; UI copy uses "conversar com vendedor".
