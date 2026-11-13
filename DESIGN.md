---
name: Ver-o-Preço
description: Regional Pará marketplace — precise, calm, quietly regional.
colors:
  acai-ink: "#6C1D6E"
  acai-ink-deep: "#541456"
  acai-mist: "#F8EEF9"
  forest-calm: "#3C6658"
  forest-deep: "#0D3B2E"
  forest-mist: "#E6F4F0"
  lavender-paper: "#FAF8FF"
  surface-white: "#FFFFFF"
  lavender-wash: "#F2F3FF"
  midnight-slate: "#131B2E"
  ash-plum: "#50434D"
  hairline: "#E2E8F0"
  success-green: "#059669"
  warning-amber: "#D97706"
  danger-red: "#BA1A1A"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: "3rem"
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "2.375rem"
    letterSpacing: "-0.02em"
  headline-small:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.5rem"
    letterSpacing: "0em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.625rem"
    letterSpacing: "0em"
  body-small:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.375rem"
    letterSpacing: "0em"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
    letterSpacing: "0.01em"
  price:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: "1.625rem"
    letterSpacing: "-0.02em"
  badge:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: "0.875rem"
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  gutter: "16px"
  gutter-desktop: "24px"
components:
  button-primary:
    backgroundColor: "{colors.acai-ink}"
    textColor: "{colors.surface-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.acai-ink-deep}"
  button-secondary:
    backgroundColor: "{colors.forest-calm}"
    textColor: "{colors.surface-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.lavender-paper}"
    textColor: "{colors.midnight-slate}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-ghost:
    textColor: "{colors.midnight-slate}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.midnight-slate}"
    typography: "{typography.body-small}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  card-product:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.midnight-slate}"
    rounded: "{rounded.xl}"
    padding: "0"
  badge-status:
    backgroundColor: "{colors.acai-mist}"
    textColor: "{colors.acai-ink}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
    height: "22px"
  nav-header:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.midnight-slate}"
    height: "72px"
    padding: "0 24px"
  search-hero:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.midnight-slate}"
    rounded: "{rounded.2xl}"
    padding: "8px"
---

# Design System: Ver-o-Preço

## Overview

**Creative North Star: "Açaí Modernism"**

The system takes the pigment of the region — açaí plum, forest green, lavender-white paper — and applies it with modernist discipline: a clean grotesque, measured spacing, one-pixel borders, and soft shadows that appear only as a response to state. Nothing performs "Amazon". The region lives in color temperature, naming, and microcopy, never in ornament.

Calm and precise. Density is medium: product imagery leads, metadata recedes to 12–13px, and the price carries the only persistent color emphasis. Purple marks action, brand, and price; forest green carries credibility and positive state. Components feel engineered rather than decorated — 8px controls, 12px cards, a 3px focus ring. Gradient is rationed to three places: two low-opacity blurred orbs behind hero content, the soft tinted auth info panels, and the single saturated seller CTA panel (Forest Deep → Açaí Ink Deep).

Trust comes from clarity: visible borders, explicit labels, honest empty and error states, and no visual claim the product cannot back — no "verified" badge, no invented ratings. The system is mobile-first; every composition is designed at 375px before it earns a desktop grid.

The product has one commercial obligation: the seller never pays to sell. That promise is carried by a plain, unhedged sentence in the interface — never by a badge, a starburst, or a countdown. It is also the reason the system stays quiet everywhere except one place: the seller CTA panel, where the only saturated gradient in the product is allowed. Voice rises once, and only for the person the product is trying to acquire.

**Key Characteristics:**
- Açaí plum as the single action and brand accent; forest green as credibility, never a second primary.
- Lavender-tinted neutrals instead of pure gray, with white cards separated by 1px borders.
- Geist grotesque with tight headline tracking and comfortable body leading.
- 8px controls, 12px cards, 16px panels, full-round badges and action pills.
- Shadows as state, not decoration.
- Regional identity carried by pigment and microcopy, not illustration.
- One saturated moment: the seller CTA. Everything else stays paper.

## Colors

A cool botanical pair — açaí plum and forest green — resting on lavender-white paper, with a narrow semantic family for status.

### Primary
- **Açaí Ink** (#6C1D6E): primary actions, the brand tile and wordmark, prices, active navigation, selected states, and the "published" listing badge. It is the only color allowed to fill a button at default weight.
- **Açaí Ink Deep** (#541456): opaque hover and pressed companion for cases where a translucent fill would reveal a noisy surface.
- **Açaí Mist** (#F8EEF9): tinted container for selected filters, empty-state icon tiles, and active status badges.

### Secondary
- **Forest Calm** (#3C6658): credibility accents — category icons, trust checks, secondary buttons, chart series.
- **Forest Deep** (#0D3B2E): high-contrast green for text on mint surfaces and deep brand moments.
- **Forest Mist** (#E6F4F0): positive and credibility surface tint.

### Neutral
- **Lavender Paper** (#FAF8FF): page background; the violet cast keeps white cards legible without gray mud.
- **Surface White** (#FFFFFF): cards, the header, and catalog surfaces. Overlays sit on Lavender Paper instead, so they read as the page lifted rather than a new object.
- **Lavender Wash** (#F2F3FF): muted blocks, skeletons, and the hover fill for ghost controls. One step deeper than the page, never a second background.
- **Midnight Slate** (#131B2E): primary text and headings; never pure black.
- **Ash Plum** (#50434D): secondary text, metadata, placeholders, captions.
- **Hairline** (#E2E8F0): every 1px border and divider; inputs share it. Named for the job, not the hue — it is a line, not a surface.

### Status
- **Success Green** (#059669) on success surface (#ECFDF5): sold state, confirmations, trust checks.
- **Warning Amber** (#D97706) on warning surface (#FFFBEB): paused listings, expiring states.
- **Danger Red** (#BA1A1A): destructive actions and validation errors; the softer `--danger` (#DC2626) is the alias used inside forms.

**The One Accent Rule.** Purple owns action and brand; green owns credibility and success. They never compete at equal weight on one screen — if a view needs both, one becomes a 10% tint or an icon.

**The Quiet Surface Rule.** Backgrounds stay lavender-neutral or white. No saturated full-bleed color blocks behind content; brand color enters through text, icons, borders, and small fills. The seller CTA is the single sanctioned exception, and it stays a contained 16px-radius panel rather than a page background.

**Dark theme.** A complete `.dark` token set exists in `src/app/theme.css`, but no theme provider or switcher is mounted. Treat dark mode as reserved, not shipped; if it ships, it must be driven by those tokens rather than one-off colors.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Geist (same stack)
**Label/Mono Font:** Geist Mono for code, IDs, and technical metadata only.

**Character:** A neutral contemporary grotesque that keeps the product looking like software, not a market flyer. Personality comes from tight headline tracking and the plum price line, not from a decorative face.

### Hierarchy
- **Display** (700, 2.5rem/3rem, −0.03em; 1.75rem/2.125rem on mobile): home and landing hero headlines only.
- **Headline** (600, 1.875rem/2.375rem, −0.02em; 1.5rem on mobile): page titles and major section openers.
- **Title** (600, 1.375rem/1.75rem, −0.01em): card group titles and dialog titles.
- **Body** (400, 1rem/1.625rem): descriptions and form copy; keep line length around 65–75ch.
- **Body Small** (400, 0.875rem/1.375rem): dense metadata, helper text, compact rows.
- **Label** (500, 0.75rem/1rem, +0.01em): control labels, navigation, small actions.
- **Price** (700, 1.25rem/1.625rem, −0.02em): every price, always in Açaí Ink.
- **Badge** (600, 0.6875rem/0.875rem, +0.02em): status and condition pills; sentence case, never all caps.

**The Tight Headline Rule.** Tracking tightens as type grows (−0.02 to −0.03em on headline and display). Body text never drops below 13px, and no user-facing copy is set in all caps.

**The Price Rule.** A price is the loudest element in a product card after the image: 20px, bold, plum, tabular where the font allows. Never grey a price to de-emphasize it.

## Layout

The container is `max-w-[1320px]` with 16px mobile gutters, 24px from `sm`, and 32px from `lg`. Reading and form surfaces narrow to `max-w-2xl`–`max-w-5xl` instead of stretching. The public header is sticky at 72px with a second search row below 768px; the category row lives inside the header block.

Product cards form a 1-column grid below 640px, 2 at `sm`, 3 at `lg`, and 4 at `xl`, with 16px gaps and a 4:3 image. Sections stack with 56–64px of vertical air (`space-y-14/16`, `py-12/16/20`); marketing heroes breathe more than task screens.

Task screens — dashboard, listings, forms — are narrower and denser: 16–24px between cards, 24px card padding, actions in a single wrapping row. Mobile filters move into a right sheet at 75% width; desktop filters stay inline. No layout is a shrunken desktop: navigation collapses into a sheet, search takes its own row, and touch targets grow to 44px.

Breakpoints follow Tailwind defaults: 640, 768, 1024, 1280, 1536. Large screens cap content rather than adding a fifth product column.

## Elevation & Depth

The system is border-led and tonally layered: depth at rest comes from a 1px Hairline border plus a lavender-to-white surface shift. Shadows are a state response, not decoration — cards sit nearly flat and lift only on hover; overlays and floating previews get the only pronounced shadows. There is no glassmorphism; the header's translucent white exists to keep content legible while scrolling, not as an effect.

### Shadow Vocabulary
- **card** (`0 1px 2px 0 rgb(15 23 42 / 0.05)`): catalog cards, feature tiles, brand tile, hero search shell.
- **card-hover** (`0 4px 6px -1px rgb(15 23 42 / 0.08)`): pointer hover on cards and feature tiles.
- **popover** (`0 10px 15px -3px rgb(15 23 42 / 0.08)`): floating previews such as the landing chat card.
- **modal** (`0 24px 48px -12px rgb(15 23 42 / 0.18)`): the deepest elevation in the system, currently only the landing phone mockup.
- **Overlays** use Tailwind's `shadow-lg`, which sits between `card-hover` and `modal`. Keep it that way until a real popover or modal surface needs the deeper tokens.

The base `Card` primitive still defaults to Tailwind's `shadow-sm`; catalog and management cards override it with `card`.

**The Resting Border Rule.** If a surface needs a shadow to be understood at rest, it needs a border instead. Shadows may only intensify with state: hover, open, dragging.

## Shapes

Corners are moderate and role-based: 8px for controls (buttons, inputs, textareas), 12px for cards and image frames, 16px for panels and the hero search shell, and full round for badges, avatars, category pills, and the header action. Dialogs use 10px; sheets are square-edged side panels. Nothing is clipped, cut, or skewed; the only non-rectangular geometry is the circle used for avatars, status dots, and the two blurred brand orbs.

Borders are always 1px Hairline; dashed borders are reserved for empty states. Icon tiles are 48–56px squares — 16px radius in empty and error states, 12px in secondary contexts — holding a 20–28px Lucide icon. Pills are earned by badges, category links, and the header CTA — not by cards or inputs.

## Components

### Buttons
- **Shape:** 8px radius; 36px default height, 32px small, 40px large, 44px for the header CTA and hero actions.
- **Primary:** Açaí Ink fill, white label, 16px horizontal padding, 14px medium label, 8px icon gap. Hover applies 90% of the fill; the deep-plum token exists for opaque surfaces.
- **Outline:** Hairline border on the page background, Midnight Slate label, extra-small shadow; hover shifts to the accent fill.
- **Ghost:** no fill at rest; hover paints Lavender Wash. Used for tertiary listing actions — Publicar, Pausar, Ver anúncio.
- **Destructive:** Danger Red fill, white label; never brand purple or green.
- **Focus:** 3px ring at 50% ring opacity plus a ring-colored border; keyboard focus is never removed.
- **Disabled:** 50% opacity, pointer events off.

### Badges and Chips
- **Style:** full round, 11px semibold, 2px × 10px padding, 1px border when a status tone is used.
- **Status mapping:** draft → muted fill with Ash Plum text; active → Açaí Mist with plum text; paused → warning surface with deep amber text; sold → success surface with deep green text; removed → red tint with red text. The label always names the state, so color is never the only signal.
- **Condition badge:** white at 95% with backdrop blur over the product image, top-left; the favorite control sits top-right.

### Cards
- **Corner Style:** 12px for product cards and image frames; 16px for panels, empty states, and management cards.
- **Background:** Surface White on Lavender Paper.
- **Shadow Strategy:** `card` at rest, `card-hover` on hover.
- **Border:** 1px Hairline.
- **Internal Padding:** 16px for product cards (the image bleeds to the edge), 20–24px for panels.
- **Product card:** 4:3 image, condition pill and favorite button overlaid, then a 16px body with a 20px plum price, an 18px semibold title clamped to two lines, a 12px location · seller line, and a 12px recency line pushed to the bottom. The image scales 3% on hover, motion-safe only.

### Inputs and Fields
- **Style:** 36px tall, 8px radius, transparent fill on white, 1px Hairline, 12px horizontal padding; 16px text on mobile to avoid iOS zoom, 14px from `md`.
- **Focus:** ring-colored border plus the 3px focus ring; no glow. The header search uses a 20% ring on `focus-within` instead of 50%.
- **Error:** destructive border and a 20% destructive ring via `aria-invalid`; the message sits below the field, never only in a toast.
- **Labels:** always visible; a placeholder is never the label.
- **Textarea:** 96px minimum height, 12px × 8px padding, identical border and focus treatment, and vertical resize left available — listing descriptions are long and people paste text.

### Navigation
- **Header:** sticky, 72px, white at 95% with backdrop blur, 1px bottom border. The brand tile is 40px, 12px radius, Açaí Ink with a Store glyph, followed by the wordmark in plum.
- **Composition:** location selector (desktop only) → centered search capped at `max-w-xl` → account area → primary "Anunciar produto" pill → mobile menu sheet. The header search is a 44px pill with a circular icon submit button. Below `md`, search moves to its own row; below `lg`, location moves into the menu.
- **Category row:** a full-round pill row that scrolls horizontally on mobile and wraps on desktop; the active category is an Açaí Mist pill with plum text, the rest are Ash Plum text that fills on hover. "Meus anúncios" is a forest-green text pill with a plus glyph, separated by a 1px divider.

### Search Bar (signature)
- **Shape:** 16px radius shell on Surface White with the card shadow and 8px padding.
- **Composition:** query field, 1px vertical dividers, location select with a plum pin, category select with a forest-green grid icon, and a primary submit button. Each segment is 48px tall; on mobile the segments stack inside the shell.
- **Behavior:** a real GET form that writes `q`, `location`, and `category` into the catalog URL, keeping search state shareable and server-rendered.

### Empty States
- **Shape:** 16px radius, dashed Hairline, white fill, centered, 64px vertical padding.
- **Composition:** a 56px icon tile in Açaí Mist with a 28px plum icon, an 18px semibold headline, one sentence of Ash Plum guidance, then a primary action and an outline escape hatch. Copy distinguishes "no listings yet" from "no results for these filters".

### Overlays (Dialog and Sheet)
- **Dialog:** 10px radius, 24px padding, `max-w-lg` from `sm` and `calc(100% - 32px)` below it, `shadow-lg` over a 50% black scrim, on the Lavender Paper background rather than white; enters with fade and a 95% scale over 200ms. Reserved for a focused decision — a confirmation, a destructive action, a short form.
- **Sheet:** square-edged, full-height, 75% width capped at 384px from `sm`, 1px inner border, `shadow-lg` on the Lavender Paper background; enters in 500ms and exits in 300ms. Used for mobile filters, the mobile menu, and panels that should slide over the page rather than interrupt it.
- **Both:** Radix focus trap, Escape and scrim dismissal, close control top-right, and a title always present even when visually hidden. No nested overlays — if a dialog needs another, the flow is wrong.

### Loading States
- **Skeletons:** `animate-pulse` on Lavender Wash, `rounded-md` by default and reshaped to match the block they replace. They mirror the final layout — same grid, same card heights — so nothing shifts when data lands.
- **Spinners:** only inside buttons and toasts for sub-second actions. A page that will take longer shows a skeleton, never a spinner.
- **Never:** a blank screen, a zero-count flash, or "Nenhum anúncio" while the query is still running.

### Motion
State transitions run 200ms with Tailwind's standard ease; sheets enter at 500ms and exit at 300ms, dialogs at 200ms. Only transform and opacity animate; continuous motion is limited to the skeleton pulse and loading spinners. Hover lift is 2px at most and image zoom is 3%, both gated behind `motion-safe`. The pulse and the spinners are the only ungated animation left — wrap them in `motion-safe` when those components are next touched.

## Do's and Don'ts

### Do:
- **Do** use Açaí Ink for primary actions, prices, the wordmark, and active states — one accent per view.
- **Do** use Forest Calm and its mists for credibility, positive state, and secondary emphasis.
- **Do** build depth with a 1px Hairline border and a surface tone shift before reaching for a shadow.
- **Do** keep controls at 8px, cards at 12px, panels at 16px, and pills for badges, category links, and the header CTA.
- **Do** keep the 3px focus ring visible on every interactive element.
- **Do** let product imagery lead at 4:3 with `object-cover` and descriptive alt text.
- **Do** write microcopy in Brazilian Portuguese, sentence case, direct: "Anunciar produto", "Conversar com vendedor", "Nenhum anúncio encontrado".
- **Do** name the state in text as well as color — status badges, errors, online/offline.
- **Do** state the seller promise in plain, unhedged text — "sem comissão sobre a venda" is a commitment, never a claim with an asterisk.
- **Do** respect `prefers-reduced-motion` and keep touch targets at 44px on mobile.

### Don't:
- **Don't** treat forest green as a second primary or place purple and green at equal weight in one view.
- **Don't** use gradients as a general language, or add glassmorphism and heavy shadows; gradient is limited to the hero orbs, the soft auth info panels, and the single seller CTA panel.
- **Don't** round cards into pills or exceed 16px on standard cards and panels.
- **Don't** drop body text below 13px, set user-facing copy in all caps, or use thin weights.
- **Don't** use color alone for status, error, or selection.
- **Don't** use emojis as interface icons; Lucide at a consistent stroke is the icon system.
- **Don't** imply verification, ratings, or guarantees the product does not have.
- **Don't** reproduce OLX or Mercado Livre layouts, components, copy, or identity.
- **Don't** show raw Supabase or database errors; translate them into human, actionable messages.
- **Don't** put saturated full-bleed color blocks behind content or color every card.
- **Don't** add a second saturated gradient panel; the seller CTA is the only one in the product.
