# ADR-0001: No commission on transactions

## Status

Accepted

## Date

2026-11-17

## Context

Ver-o-Preço serves occasional and first-time sellers in Pará who have idle items at home. National marketplaces take a cut of the sale, and informal WhatsApp groups have reach but no structure, history or privacy. The platform's positioning against both depends on a promise that is easy to understand and hard to dilute over time.

## Decision

The seller keeps 100% of the sale. Ver-o-Preço charges no commission on transactions, and this is a durable product principle, not launch copy.

Revenue beyond that promise is an open decision. Promoted listings, optional services or advertising may be explored later, but none may become a hidden transaction fee.

## Alternatives Considered

### Commission per sale
- Pros: direct revenue tied to successful transactions.
- Cons: contradicts the positioning; requires payment/escrow infrastructure in the MVP; pushes sellers back to informal groups.
- Rejected: it undermines the main reason a seller would choose this marketplace.

### Free during launch, commission later
- Pros: easier early growth.
- Cons: reads as a temporary trick and makes future pricing changes a betrayal of early users.
- Rejected: "taxa zero" is recorded as a durable promise in `PRODUCT.md`.

## Consequences

- The MVP needs no payments, escrow or shipping.
- A future revenue source must be decided explicitly in a new ADR; it cannot be introduced as an implementation detail.
- Product copy may state "sem comissão sobre a venda" because it is backed by this decision.
