# The Pickleball Court — Design System Handoff

Reference implementation: `The Pickleball Court - Design Spec.dc.html` (visual spec, all screens stacked).

## Brand
- Name: The Pickleball Court (thepickleballcourt.ca)
- Tone: knowledgeable, friendly, energetic, honest
- Fonts: **Sora** (display/headings, weights 600/700/800) + **Source Sans 3** (body, weights 400/600/700, italic 400) — via Google Fonts. Monospace accents use **Source Code Pro**.

## Color tokens
```css
--color-primary:       #1C4E80;  /* Court Blue */
--color-primary-dark:  #123449;
--color-secondary:     #2E7D5B;  /* Court Green */
--color-secondary-dark:#1F5A41;
--color-accent:        #FF6B35;  /* Match Point Orange — CTAs only */
--color-accent-dark:   #DB5220;
--color-star:          #F0A93B;  /* rating gold */
--color-ink:           #1A2027;
--color-ink-muted:     #5B6570;
--color-ink-faint:     #8B93A0;
--color-border:        #E3E0DA;
--color-bg:            #FAF8F4;
--color-surface:       #FFFFFF;
```
Footer / dark sections use `#0F1E2B` background with `#C7D6E0` text.

## Spacing (8px base)
```css
--space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
--space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px; --space-9: 96px;
```

## Radius & shadow
```css
--radius-sm: 6px; --radius-md: 12px; --radius-lg: 20px; --radius-pill: 999px;
--shadow-sm: 0 1px 2px rgba(26,32,39,.08);
--shadow-md: 0 4px 16px rgba(26,32,39,.10);
--shadow-lg: 0 12px 32px rgba(26,32,39,.14);
```

## Type scale
| Style | Font | Weight | Size | Line-height |
|---|---|---|---|---|
| H1 | Sora | 800 | 48px | 1.1 |
| H2 | Sora | 700 | 36px | 1.2 |
| H3 | Sora | 700 | 28px | 1.3 |
| H4 | Sora | 600 | 20px | 1.4 |
| Body | Source Sans 3 | 400 | 17px | 1.6 |
| Small | Source Sans 3 | 400 | 14px | 1.5 |

Article body measure: 65–75ch max-width.

## Buttons
- **Primary (AffiliateButton)**: `background: var(--color-accent)`, white text, `font-family: Sora`, `font-weight:700`, `border-radius: var(--radius-pill)`, `box-shadow: var(--shadow-md)`. Hover: `background: var(--color-accent-dark)`, `box-shadow: var(--shadow-lg)`, `translateY(-1px)`. Focus: `box-shadow: 0 0 0 3px #fff, 0 0 0 6px var(--color-primary)`.
- **Secondary**: transparent bg, 2px `var(--color-primary)` border, primary-color text. Hover: filled with `var(--color-primary)`, white text.
- **Text link**: `var(--color-primary)`, hover `var(--color-accent)` with underline.

## Components → Astro component names
| Component | Notes |
|---|---|
| `Nav` | Sticky top; logo, Paddles/Shoes/Nets/Guides links, search icon, "Best Picks" CTA |
| `MobileNav` | Hamburger, slide/expand menu |
| `Footer` | 4-col: brand blurb, Shop, Learn, Legal (incl. affiliate disclosure + privacy links) |
| `AffiliateButton` | Primary CTA, pill shape, accent color — the conversion anchor |
| `ProductCard` | image, brand (secondary color, uppercase), name, StarRating, price tier ($/$$/$$$), CTA |
| `StarRating` | gold stars + optional review count |
| `ComparisonTable` | desktop: table w/ product columns; mobile: stacked cards per product, CTA each |
| `ProsCons` | 2-col, green tint (pros) / warm tint (cons) |
| `Callout` (“Our Pick”) | dark primary bg, accent badge tag |
| `FaqAccordion` | bordered list, expand/collapse rows |
| `Breadcrumbs` | muted trail, current page bold |
| `AuthorBio` | avatar placeholder + byline + credentials (role-based, no fake names) |
| `TableOfContents` | sticky sidebar on desktop; collapses to a "Jump to a section" dropdown on mobile |
| `RelatedArticles` | small horizontal cards |
| `DisclosureStrip` | affiliate disclosure banner at top of articles |
| `CategoryCard` | homepage category tiles |
| `FilterBar` | chip filters + sort dropdown (category pages) |
| `Pagination` | numbered page control (guides hub) |

## Pages mocked
1. Homepage (desktop + mobile)
2. Category page — Paddles (desktop)
3. Buying guide / pillar article (desktop + mobile) — disclosure strip, TOC, spotlight cards, comparison table, pros/cons, FAQ, author bio, related articles
4. Comparison article — verdict box + comparison table centerpiece + per-product cards
5. Guides hub / blog index — chips + card grid + pagination
6. Trust page (About / How We Test) — methodology steps + team panel (role-based, no fake names)

## Build notes for Astro/Cursor
- Load Sora + Source Sans 3 via `<link>` in the base layout head; define all tokens above as CSS custom properties on `:root`.
- Placeholder imagery in the spec uses a striped pattern block — swap for real photography/`<Image>` components at the same aspect ratios (hero 21:9, category 16:9, product card 4:3, avatar 1:1 circle).
- Author bylines are role-based ("Gear Review Team", "Lead Tester", etc.) — no fabricated personal names; wire to real author data once available.
