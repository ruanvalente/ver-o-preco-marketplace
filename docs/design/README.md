# Design System — Ver-o-Preço

This document is a reference for the design tokens and guidelines established in `DESIGN.md`.

## Tokens

Tailwind CSS v4 is configured through CSS. The design tokens live in `src/app/theme.css`, imported by `src/app/globals.css`.

- Primary: Açaí Purple (`#6C1D6E`)
- Secondary: Forest Green (`#3C6658`)
- Background: soft lavender surface (`#FAF8FF`)
- Foreground: dark neutral (`#131B2E`)
- Typography: Geist (loaded in `src/app/layout.tsx`)
- Radius: inputs/buttons `md` (8px), cards `xl` (12px), dialogs `2xl` (16px)

Components must consume semantic utilities (e.g. `bg-primary`, `text-muted-foreground`, `bg-surface-container`) instead of hard-coded colors.

## Components

Base primitives live in `src/components/ui/` (shadcn/ui compatible). Layout primitives live in `src/components/layout/`.

## Principles

- Mobile-first
- Accessibility
- Minimal and regional without being stereotypical
