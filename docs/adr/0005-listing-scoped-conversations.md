# ADR-0005: Conversations are scoped to a listing

## Status

Accepted

## Date

2026-11-17

## Context

A marketplace chat that allows arbitrary conversations becomes a generic messaging app: unsolicited contact, no shared context and unclear authorization. Every legitimate interaction here starts from a specific item a buyer found.

## Decision

Every conversation is associated with a product listing. A user cannot start a conversation without that product context. Participants are the buyer who initiated it and the seller who owns the listing; authorization checks participation in the database, not in the UI.

## Alternatives Considered

### Open conversations between any two users
- Pros: flexible; simpler data model.
- Cons: enables spam and unrelated messaging; no product context in the chat header; harder to define authorization.
- Rejected: the product purpose is negotiating about a listing.

### Contact form instead of chat
- Pros: minimal implementation.
- Cons: no history, no realtime, no read state; negotiation moves off-platform.
- Rejected: contradicts ADR-0002.

## Consequences

- `conversations` and `messages` carry the product/participant relationship in the schema and RLS policies.
- Starting a conversation from a listing is the only supported entry point.
- Unauthenticated users who try are prompted to log in or create an account.
