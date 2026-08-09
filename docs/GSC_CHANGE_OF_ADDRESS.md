# Google Search Console — dual CA + US (not Change of Address)

**Status (2026-08-09):** Dual indexable hosts restored. The CA→US Change of Address move was **cancelled**. Do **not** re-submit Change of Address while both sites should rank independently.

## Current architecture

| Host | Pages project | Build command | Associates tag |
|---|---|---|---|
| `https://thepickleballcourt.ca` | `the-pickleball-court-ca` | `npm run build:ca` | `thepickleb050-20` (amazon.ca) |
| `https://uspickleballcourt.com` | `the-pickleball-court` | `npm run build:us` | `uspickleball-20` (amazon.com) |

- Reciprocal `hreflang` (`en-CA` / `en-US` / `x-default` → CA) on shared paths.
- Market-only news omits hreflang and 404s on the other host.
- Zone consolidation 301s on `.ca` are **disabled**.

## GSC checklist (both properties)

1. Keep URL-prefix (or Domain) properties verified for **both** hosts.
2. Submit each sitemap:
   - `https://thepickleballcourt.ca/sitemap-index.xml`
   - `https://uspickleballcourt.com/sitemap-index.xml`
3. Use URL Inspection on money URLs for each host (`/`, paddle guide, `/gear/paddles`, `/news`).

## Do not

- Enable CA→US zone redirects while dual SEO is intended.
- Point hreflang at a host that 301s.
- Use Change of Address unless you deliberately consolidate again.
