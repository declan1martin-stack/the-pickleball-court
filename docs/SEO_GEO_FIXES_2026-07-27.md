# SEO & GEO fixes

## Traffic / indexing pass (2026-08-06)

GA4 (shared property `G-JWSBZJ6R4P`, last 7 days): **128 sessions**, ~95% Direct, **0 Organic Search**, ~18% engagement. Most “traffic” is self/direct; Google organic is the real gap.

| Check | Finding | Fix |
|---|---|---|
| CA GSC Performance | 92 impressions / 0 clicks / avg pos ~55.8 | Content + indexing velocity (ongoing) |
| CA URL Inspection (homepage) | **Indexed**, but Product/Merchant **3 invalid items** | Removed incomplete `Offer` (no price + claimed InStock) from `productSchema` |
| CA Pages report | Stale “Indexed 0 / Crawled–not indexed” (last update Jul 23) | Ignore lag; re-request indexing on pillars after deploy |
| CA Sitemap | Submitted Jul 25; last read Aug 1; **38** discovered (live sitemap now ~51) | Resubmit after deploy; sitemap now emits `lastmod` |
| US GSC | **Not verified** | Human: add `https://uspickleballcourt.com/` URL-prefix property + HTML file verify + submit sitemap |
| Domain properties | `sc-domain:` not verified | Optional DNS TXT verify for CA + US |
| `www.uspickleballcourt.com` | Served **200** (duplicate host) | Middleware **301 → apex** |
| GSC `.html` verify file | Pages **308** stripped `.html` | Middleware serves exact `.html` body |
| IndexNow | Missing | Key file + `npm run ping:indexnow` after deploy |
| Homepage OG | Product SKU image | Switched to `/og-default.png` |

### Human follow-ups (cannot finish from code alone)

1. **Deploy** this branch to Cloudflare Pages.
2. GSC CA → URL Inspection → **Request indexing** for `/`, `/guides/best-pickleball-paddles-2026/`, `/guides/how-to-choose-a-pickleball-paddle/`, `/guides/best-pickleball-shoes-2026/`, `/news/`.
3. GSC CA → Sitemaps → resubmit `/sitemap-index.xml` (expect ~51 URLs).
4. **Verify US** property in Search Console + submit US sitemap.
5. Bing Webmaster → import from GSC (or add both hosts) so IndexNow attributions show.
6. After deploy: `INDEXNOW_KEY=e5fdb4b489461004ccd84ae7e188ac12 npm run ping:indexnow`
7. Cloudflare zone for US: set **www → apex** redirect at DNS/SSL level too (belt-and-suspenders with middleware).
8. Off-page: 5–10 club/directory citations (new sites need external trust for “Crawled – currently not indexed”).

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
| US Cloudflare Managed robots Disallow AI bots | **Fixed** 2026-07-31 — zone `bot_management`: `is_robots_txt_managed=false`, `ai_bots_protection=disabled` |

### Cloudflare AI crawl (done)

Verified live: `https://uspickleballcourt.com/robots.txt` has no `# BEGIN Cloudflare Managed content` block; GPTBot / ClaudeBot / Google-Extended / Amazonbot / Applebot-Extended are `Allow: /`.

## Earlier audit notes (2026-07-27)

Still useful for GSC / Bing / off-page work:

| Check | Status |
|---|---|
| GSC domain property + sitemap submit + URL Inspection | **Human** |
| Bing Webmaster import | **Human** |
| Named author + headshot | **Human** |
| Off-page citations / club outreach | **Human** |
