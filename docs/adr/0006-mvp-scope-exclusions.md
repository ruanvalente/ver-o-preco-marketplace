# ADR-0006: Explicit MVP scope exclusions

## Status

Accepted

## Date

2026-11-17

## Context

A regional marketplace can absorb endless features — payments, logistics, trust systems, moderation, analytics. The team is small, mobile is the reference experience, and the MVP must ship a coherent loop: publish, find, negotiate.

## Decision

The MVP excludes payments, shipping, escrow, reviews and seller ratings, delivery tracking, ads, subscription plans, recommendation engines, moderation/reporting and admin tooling. Future modules may be added, but the current architecture does not accommodate them prematurely.

Seller verification and trust badges also do not exist. Nothing in the UI may imply verification before a real system exists.

## Alternatives Considered

### Include payments and escrow in the MVP
- Pros: end-to-end transaction inside the platform.
- Cons: regulatory and operational burden; contradicts the in-person deal model and the no-commission promise; delays the core loop.
- Rejected: deals close in person in this product.

### Leave scope implicit
- Pros: no documentation overhead.
- Cons: every new idea looks in scope; agents and contributors re-litigate the same decisions.
- Rejected: `PRODUCT.md` records these as deliberate exclusions.

## Consequences

- A proposal in any excluded area requires a new ADR before implementation.
- Copy must not suggest protections the product does not provide (verified seller, secure payment).
- The architecture leaves room for future modules without creating empty placeholders.
