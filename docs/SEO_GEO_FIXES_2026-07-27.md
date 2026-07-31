# SEO & GEO fixes

## Dual-region pass (2026-07-31)

Code fixes for the CA/US shared Pages project:

| Item | Status |
|---|---|
| US Canada-centric copy + CAD leaks | **Fixed** via `functions/_middleware.js` CA→US rewrite + regionized templates |
| hreflang `en-CA` / `en-US` / `x-default` | **Fixed** in `Layout.astro` (middleware restores CA/x-default after host rewrite) |
| Title mid-word truncation | **Fixed** — soft word-boundary trim in `formatPageTitle` |
| Homepage + category affiliate disclosure | **Fixed** — `Disclosure` on Featured Gear + `/gear/*` |
| Gear breadcrumb “Gear” → `/guides` | **Fixed** — Gear crumb is non-linked |
| Heading hierarchy on category grids | **Fixed** — sr-only `h2` wrappers around product cards |
| Catalog price currency label | **Fixed** — `formatCatalogPrice` / middleware `CAD`→`USD` |
| US Cloudflare Managed robots Disallow AI bots | **Human** — see below |

### Human: disable Cloudflare AI crawl blocks on US zone

Cloudflare can prepend a Managed robots block (`Disallow: /` for GPTBot, ClaudeBot, Google-Extended, Amazonbot, etc.) that overrides our `robots.txt` / Pages Function.

In Cloudflare Dashboard for **uspickleballcourt.com**:

1. Security → **AI Crawl Control** (or Bots → AI Crawl Control)
2. Turn **off** managed robots blocking / “Block AI crawlers via robots.txt”
3. Or API: set zone `bot_management` `is_robots_txt_managed: false`

Verify:

```bash
curl -sS https://uspickleballcourt.com/robots.txt | head -40
```

You should **not** see a Cloudflare Managed header with `Disallow: /` for GPTBot / ClaudeBot / Google-Extended / Amazonbot. Our file should Allow those agents.

## Earlier audit notes (2026-07-27)

Still useful for GSC / Bing / off-page work:

| Check | Status |
|---|---|
| GSC domain property + sitemap submit + URL Inspection | **Human** |
| Bing Webmaster import | **Human** |
| Named author + headshot | **Human** |
| Off-page citations / club outreach | **Human** |
