# Full site audit — discoverability, SEO, GEO, Core Web Vitals

**Date:** 2026-08-08
**Scope:** Audit only — no application code changed.
**Host audited:** `https://uspickleballcourt.com` — the only indexable host since today's CA→US consolidation.
**Method:** live crawl of all 53 sitemap URLs; Lighthouse 12 mobile runs on 4 page types; header, redirect and crawler-user-agent probes; static analysis of all 55 built HTML files and all 311 JSON-LD blocks; `rewriteForUs()` applied to the CA build to simulate the US host.

---

## Executive summary

The consolidation you shipped today works at the edge. `thepickleballcourt.ca` 301s cleanly to `uspickleballcourt.com` in a single hop, the US host returns 200 on all 53 URLs, there are no redirect chains, no broken internal links, and no canonical mismatches.

**The codebase never caught up with it.** Production still builds the *Canadian* site (`PUBLIC_SITE_REGION=ca`) and `functions/_middleware.js` string-substitutes it into US copy on every request. Almost every critical finding below is a direct consequence of that one unresolved fact, plus a second architectural choice — region filtering implemented in client-side JavaScript — that hides content from the AI crawlers you are trying to reach.

Three root causes explain the majority of findings:

| Root cause | Symptoms it produces |
|---|---|
| Edge string-rewrite instead of a US build | Canadian prices labelled USD; a fabricated "US National Pickleball League"; "shoppers in the US and the US"; Canada facts under US headlines; HTML that can never be edge-cached |
| Client-side region gating | Homepage news section invisible without JS; CA-only articles indexed on a US-only site |
| Template-generated copy | 13 paragraphs repeated across 17–19 guides; the same H2 five times on one page; 12 titles truncated mid-sentence |

Measured health: Lighthouse mobile **performance 71–74**, accessibility 96–97, best practices 100, SEO 92. CLS is 0 everywhere and TBT is 10–60 ms — layout stability and interactivity are genuinely good. LCP is 4.7–5.3 s, which is "poor", and 85–87 % of it is render delay from three blocking resources.

---

## CRITICAL

### C1. US visitors are shown Canadian prices relabelled as USD

`src/data/gear.json` stores price as a literal string with the currency baked in:

```json
{ "id": "joola-perseus-16mm", "name": "JOOLA Perseus 16mm Pickleball Paddle", "price": "$164.50 CAD" }
```

`_middleware.js:70` applies `.replaceAll(' CAD', ' USD')`, which changes the label and keeps the number. Verified live on `uspickleballcourt.com/gear/paddles`:

```
Approx. listed $28.71 USD — confirm current price on the US store
```

75 of 80 catalog products carry exact CAD amounts, and roughly 40 render as visible price strings on `/gear/paddles` alone. Affected pages include all seven `/gear/*` categories and at least eight guides.

| Product | Stored | Shown to US visitors |
|---|---|---|
| Selkirk SLK Halo Control XL | $289.99 CAD | $289.99 USD |
| JOOLA Vision C15 | $191.99 CAD | $191.99 USD |
| ONIX Portable Net System | $229.99 CAD | $229.99 USD |
| X-26 Indoor Pickleballs 12-pk | $66.83 CAD | $66.83 USD |

This is the most serious finding in the audit, and it is not primarily an SEO problem. It presents fabricated prices to US shoppers, which conflicts with the "never fabricate prices" rule in `.cursorrules` and with the Amazon Associates Operating Agreement. The "approximate / not live" hedging is good and would have covered you — but only for a number that was real in the stated currency.

*(This supersedes a softer read in my first pass, which assessed the labelling mechanism without tracing the underlying values back to `gear.json`.)*

### C2. The edge rewrite invents facts on the US host

`.replaceAll('Canadian ', 'US ')` is a catch-all. On the two CA roundups it produces claims that are simply false:

| Canadian source | Served on uspickleballcourt.com |
|---|---|
| "the **Canadian National Pickleball League** heading to London, Ontario" | "the **US National Pickleball League** heading to London, Ontario" |
| "the number of **Canadians** playing pickleball at roughly 1.8 million" | "the number of **US players** playing pickleball at roughly 1.8 million" |
| "This Week in **Canadian** Pickleball: Nationals Coming to Toronto" | "This Week in **US** Pickleball: Nationals Coming to Toronto" |

The first invents a league that does not exist. The second is off by roughly 20× and is ungrammatical. Bodies keep "Pickleball Canada's 2026 National Championship… Greater Toronto Area" and "Ontario leads participation, followed by Quebec and British Columbia" under a US headline.

It leaks into structured data too — `Article.headline` says US while `Article.description` says Canada in the same block — and into the author bio on **37 pages**, where `' in Canada'` → `' in the US'` yields, verified live:

> "…portable nets for shoppers in **the US and the US**."

Two more surface in catalog copy: "one of **Canada's** most searched JOOLA paddles" survives untouched on `/gear/paddles` (the rules require a trailing space, so bare "Canada" is skipped), and `/privacy` now reads "have a **US** privacy lawyer review…" while `/terms` still says "for **Canada**".

### C3. hreflang points at a host that 301-redirects

Every page emits three alternates, two aimed at the now-dead CA host:

```html
<link rel="alternate" hreflang="en-CA"     href="https://thepickleballcourt.ca/guides/best-pickleball-paddles-2026">
<link rel="alternate" hreflang="en-US"     href="https://uspickleballcourt.com/guides/best-pickleball-paddles-2026">
<link rel="alternate" hreflang="x-default" href="https://thepickleballcourt.ca/guides/best-pickleball-paddles-2026">
```

Verified: the CA URL returns `301`. hreflang annotations must resolve to 200 or Google discards the cluster, and an `x-default` pointing at a redirect muddies exactly the authority signal the consolidation was meant to clean up. Source: `hreflangAlternates()` in `src/lib/seo.ts:50-67` hardcodes `caRoot`.

**Fix:** delete hreflang emission. With one host there is nothing to annotate.

### C4. Every unknown URL returns HTTP 200 with the homepage

```
GET /this-page-does-not-exist → HTTP/2 200, <h1>The Definitive Guide to US Pickleball</h1>
```

There is no `src/pages/404.astro`. Any typo, stale backlink, or crawler-invented URL is served as a 200 homepage clone. This wastes crawl budget, produces "Soft 404" reports in Search Console, and makes an unlimited number of junk URLs look valid. The self-referencing canonical to `/` limits index bloat but does not fix the status code.

### C5. The homepage news section does not exist without JavaScript

All 8 cards in `data-weekly-updates` ship with the `hidden` attribute. An inline script in `LatestWeeklyUpdates.astro:103-166` reads `window.location.hostname`, un-hides the matching cards, reorders them, and `.remove()`s the rest. `/news` uses the same pattern across 10 cards, as does `RegionGate.astro`.

```
cards in server HTML: 8 — all hidden=True (markets: ca, us, ca, ca us, us, ca us, ca us, ca us)
```

GPTBot, OAI-SearchBot, PerplexityBot and ClaudeBot do not execute JavaScript. They fetch your news-first homepage and find a lead section of hidden markup. Google renders JS and will eventually see it, but hidden-at-parse content is rendered on a delay and weighted less. It also violates the project's own "no new client-side JavaScript" rule.

`getNewsForMarket()` already exists in `src/lib/news.ts:19` and is unused for routing — the filter can move to build time today.

### C6. Canada-only articles are live and indexed on a US-only site

`markets: ["ca"]` is enforced only in that client-side JS, so the pages still build, stay canonical, sit in the sitemap, and return 200. Two are affected (`ca-roundup-cnpl-central-split-august-2026`, `ca-roundup-cnpl-nationals-ppa-canada-august-2026`). Their hero alt text shows the rewrite tearing at the seam: *"a big **US** August takes shape, **Canada** pickleball roundup for August 1 to 8, 2026"*.

### C7. Guides are 16–35 % original text

Measuring words in `<p>`/`<li>` blocks of 8+ words inside `<main>`, then subtracting blocks appearing on 5+ other pages:

| Page | body words | original |
|---|---:|---:|
| `/guides/best-pickleball-paddles-for-beginners` | 1658 | **16 %** |
| `/guides/pickleball-vs-tennis` | 1472 | **17 %** |
| `/guides/best-pickleball-paddles-for-control` | 1616 | **18 %** |
| `/guides/best-pickleball-gear-for-seniors` | 1716 | **20 %** |
| `/guides/carbon-fiber-vs-fiberglass-paddles` | 1546 | **21 %** |

12 guides sit at or below 25 %. Only 4 of 26 clear 70 %. Thirteen paragraphs appear verbatim on 17–19 guides each — including one containing the grammar error "an return-friendly store order".

Worse, the same block repeats **within** a single page. `/guides/best-pickleball-paddles-for-control` renders the H2 "Extra practical notes for Canadian players" **five times**, each followed by the identical 112-word paragraph. Verified live on the US host (as "Extra practical notes for US players", ×5). That H2 string occurs **77 times across 26 guides**, and it pollutes the on-page table of contents — `/guides/pickleball-court-dimensions` lists it five consecutive times.

The median guide is 1,884 words in `<main>`, so depth looks fine on paper. The problem is composition, not length. This is the most likely on-page contributor to the organic collapse, independent of the dual-host duplication already diagnosed in `audit-report.md`.

### C8. All 83 `Product` blocks publish Amazon affiliate URLs as the entity's canonical `url`

Verified live — 45 Product blocks on `/gear/paddles`, every one shaped like:

```json
{"@type":"Product","name":"Diadem ICON Performance Pickleball Paddle",
 "url":"https://www.amazon.com/dp/B098TNZSXH?tag=uspickleball-20"}
```

All 80 `ItemList` entries do the same, and five of them point at Amazon **search** pages, so the named entity does not resolve to a specific product at all.

Three problems. `Product.url` is defined as the URL of the page describing the item, so this tells every parser that Amazon — not you — is the canonical description, destroying the citation you are trying to earn. And critically, **JSON-LD cannot carry `rel="sponsored nofollow noopener"`**: 163 tagged affiliate URLs are emitted in machine-readable markup with no disclosure attribute, on pages where the visible links are correctly attributed. That bypasses the entire affiliate-compliance rule set.

Source: `ProductCard.astro:34` and `gear/[category].astro:90`.

---

## HIGH

### H1. Core Web Vitals fail on mobile, and it is render delay, not images

| Page | Perf | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|
| `/` | 71 | 2.9 s | **5.3 s** | 10 ms | 0 |
| `/guides/best-pickleball-paddles-2026` | 71 | 3.5 s | **5.2 s** | 60 ms | 0 |
| `/gear/paddles` | 74 | 3.7 s | **4.7 s** | 10 ms | 0 |

The phase breakdown is what matters — on all three pages, **85–87 % of LCP is Render Delay**:

```
/  TTFB 13% (673ms) | Load Delay 0% | Load Time 0% | Render Delay 87% (4625ms)
```

Three render-blocking resources cause it:

| Resource | Wasted |
|---|---:|
| `http://classic.avantlink.com/affiliate_app_confirm.php?…` | 780 ms |
| `https://fonts.googleapis.com/css2?family=Sora…` | 835 ms |
| `/_astro/Layout.p9q9miM5.css` | 150 ms |

The AvantLink tag is the worst and the easiest to remove: a **synchronous, parser-blocking, third-party script over plain `http://`** with `data-cfasync="false"`, sitting in `<head>` *above* your own stylesheet. `consolidation-report.md` already notes it should go once approval lands. Removing it and self-hosting the three Google font families should recover roughly 1.5 s.

### H2. Twelve titles are machine-truncated mid-phrase with a literal "…"

`softTrimTitle()` (`seo.ts:31-37`) clips at 60 characters. These ship to SERPs incomplete even though most are only 54–59 characters:

```
How to Choose a Pickleball Paddle: The Complete Beginner's…   (→ "Beginner's Guide")
Carbon Fiber vs Fiberglass Pickleball Paddles: What's the…    (→ "What's the Difference?")
JOOLA vs Selkirk vs Six Zero: Which Paddle Brand Is Right…    (→ "Is Right for You?")
This Week in US Pickleball: CNPL Lands in London, a…          (→ "a Big August Ahead")
Best Pickleball Paddles Under $100: A Practical Buyer's…      (→ "Buyer's Guide")
```

Several get *worse* on the US host: the rewrite shortens the string but the ellipsis stays, so "This Week in US Pickleball: CNPL Lands in London, a…" is truncated at only 52 characters. A dangling "a…" gives an AI engine an incomplete claim to quote. Truncation should be a build warning, not a shipping behaviour.

Fourteen meta descriptions have the same problem via `clampMetaDescription()`, cut at 154–155 characters mid-clause.

### H3. Every affiliate CTA fails WCAG AA contrast

| Token | Usage | Ratio | Needs |
|---|---|---:|---:|
| `--color-accent: #ff6b35` on white | `.btn-primary` — every affiliate CTA | **2.83:1** | 4.5:1 |
| `--color-ink-faint: #8b93a0` on white | price / disclaimer microcopy, 12 px | **3.09:1** | 4.5:1 |
| `#059669` on white | `.site-logo__kicker`, 11 px bold | **3.76:1** | 4.5:1 |

45 failing buttons on `/gear/paddles` alone; Lighthouse counted 90 contrast violations there. Darkening accent toward `#c2410c` and `ink-faint` toward `#6b7280` clears AA without changing the design language. Note `#059669` is a raw hex at `global.css:205`, outside the token system — it arrived with the logo work.

### H4. There is no entity graph — 0 `@id` references across 311 JSON-LD blocks

`Organization` and `WebSite` are emitted as standalone islands on all 53 pages with no reconciliation key, so to a parser the `Organization` on `/about` is a different entity from the one on every guide. `Article.publisher` is a separate inline stub. `Organization.founder` is a fourth unlinked copy of the author. No `Article` has `isPartOf`.

`Breadcrumbs.astro:22` compounds it by using `new URL('/', SITE_URL).href` (trailing slash) while `absoluteUrl('/')` deliberately returns none — so every BreadcrumbList names the homepage differently from the canonical.

**Fix:** emit one `@graph` per page from `Layout.astro` with stable anchors (`#organization`, `#website`, `#person`, `#webpage`) and replace inline nested entities with `@id` references. This mechanically fixes several MEDIUM findings below.

### H5. `/llms.txt` is incomplete, stale by construction, and misdescribes the site

It is a hardcoded template literal, so it cannot track content:

- **27 of 53 routes listed** — missing 16 of 26 guides and **all 10 news entries**.
- **A false claim about your own pricing:** *"Prices are shown as approximate $–$$$$$ tiers"* — but 75 of 80 products carry exact amounts. The one file you hand directly to AI agents misdescribes how you present prices.
- **25 URLs use a trailing slash** on a `trailingSlash: 'never'` site, so every entry costs a 308 redirect. The file even contradicts itself, using `/affiliate-disclosure` on line 9 and `/editorial-policy/` on line 49.
- **Zero markdown links.** The convention is `- [Name](url): description`; this file uses plain `- Home: https://…`, so a parser expecting link lists extracts nothing.
- No `/news/feed.xml` reference and no "last updated" date.

Generate it from the content collections the way `rss.xml.js` already does.

### H6. Zero of 26 guides cite a primary source

There is exactly one primary-source citation on the entire site (`usapickleball.org`, on `/about`). Meanwhile the guides make regulation claims that demand one — court dimensions, kitchen depth, net heights, "USA Pickleball-approved" ball claims — all asserted without a link.

For news, 6 of 10 entries set `sourceUrl`, but **the 4 that don't are all the roundups** — the pieces carrying participation figures, ranking-system launches and playoff results. Where `sourceUrl` exists, the anchor text is the literal word `"source link"` with no publisher name. AI grounding pipelines weight corroboration heavily; a page making checkable claims and linking nothing reads as an unverifiable secondary source.

### H7. The "Quick answer" box repeats the meta description instead of answering

`Layout.astro` renders the description as the H1 subhead, `guides/[slug].astro:110-114` renders it *again* in a Quick-answer box, and 17 of 26 MDX bodies open by repeating it a *third* time verbatim. On `/guides/pickleball-court-dimensions` all three are byte-identical:

> "Pickleball court dimensions, kitchen lines, and a practical portable net setup guide for driveways and parks in Canada."

That describes the page rather than answering the question. The actual answer — the most quotable fact on the site — is buried under an H2 as a fragment with no units: *"20x44 court, 7-foot kitchens each side, net 36" posts / 34" center."*

The box is a good idea wired to the wrong data source. Add a `quickAnswer` field with complete, self-contained sentences.

### H8. The author entity cannot be resolved to a real person

`authors.json` defines `"id": "declan-martin"` with `"name": "Deco"`. So the page at `/authors/declan-martin` renders as "Deco", `Person.name` is "Deco", and `Organization.founder.name` is "Deco" — a mononym no knowledge graph can resolve, on a slug bearing a different name. No `sameAs`, no `worksFor`, no credentials, no location. A `LINKEDIN_PROFILE_DRAFT.md` sits untracked in the repo root, so a real identity exists and simply isn't linked.

The page also has **zero H1** — the only page in the crawl with none, and it is the second-most-linked page on the site (37 contextual inbound links).

### H9. `Product` schema is ineligible for any rich result, and the fix is already written

All 83 blocks carry only `name`, `description`, `image`, `brand`, `url`. Google requires at least one of `offers` / `review` / `aggregateRating`, so all 83 produce "missing field" warnings and no enhancement.

The instinct to omit prices is correct and documented at `seo.ts:198-199` — and verified: **zero** `price`, `priceCurrency`, `availability` or `aggregateRating` strings across all 311 blocks. Do not add prices. But `reviewSchema()` at `seo.ts:214-244` **is never called anywhere in the codebase**. Your own editorial evaluation is first-party content you are entitled to mark up.

---

## MEDIUM

- **HTML is never edge-cached.** `cache-control: public, max-age=0, must-revalidate`, `cf-cache-status: DYNAMIC` — because the middleware intercepts every request to rewrite the body. Building US directly would let Pages serve static HTML from cache.
- **No `public/_headers`.** `/_astro/*.css` returns `max-age=14400` despite content-hashed filenames that should be `max-age=31536000, immutable`. Also no `X-Content-Type-Options`, `Referrer-Policy` or `Permissions-Policy`.
- **Sitemap `lastmod` is falsified.** `serialize()` sets `new Date()` on all 53 URLs every build. Google discounts `lastmod` that doesn't correlate with real change — this trades a genuine freshness signal for a worthless one. Use `updatedDate`.
- **Unsplash heroes ship at ~2× needed pixels** — 444 KiB wasted on the homepage, 212 KiB on the paddles guide, with no `preconnect` to `images.unsplash.com`.
- **One hero image is the `og:image` for 11 guides** (`photo-1762423570127-…`). Four more are reused across 3–4 pages each. Nine pages fall back to `og-default.png` and **seven news pages set `Article.image` to `/favicon.svg`** — not a valid article image in any format Google accepts.
- **News pages use `Article`, never `NewsArticle`**, and `dateModified === datePublished` on 10 of 10 (the schema has no `updatedDate` field). `NewsArticle` is what recency heuristics key on.
- **`/guides` and `/news` carry no `ItemList`** despite `itemListSchema()` existing — these are the highest-value pages for an AI enumerating what the site covers. The homepage has no `BreadcrumbList` either.
- **Six trust pages have no page-type schema** (`AboutPage`, `ContactPage`) and no visible date — exactly the pages an AI reads to assess whether to trust the domain.
- **`Organization` is incomplete**: `sameAs: []` emitted literally, `name` is a domain string, no `publishingPrinciples` despite `/editorial-policy` existing.
- **`Organization.logo` is an SVG favicon** with no dimensions. Google's logo requirements exclude SVG; `og-default.png` already exists.
- **Four commodity gear categories have 2 contextual inbound links each** (`/gear/accessories`, `/apparel`, `/bags`, `/balls`) against 13 for `/gear/paddles`, and each links out to only 2 pages — below the `.cursorrules` bar of ≥3.
- **H1 duplicates the `<title>` verbatim on 20 pages.**
- **RSS feeds contradict canonicals** — both emit trailing-slash `<link>` and `guid isPermaLink="true"`. No `atom:link rel="self"`, no `lastBuildDate`, no `content:encoded`. `/news/feed.xml` has no autodiscovery link. `<language>en-ca</language>` survives the US rewrite.
- **Guides have zero `<time datetime>` elements** — dates are rendered via `toLocaleDateString` into a plain `<p>`. News pages do it correctly.
- **`robots.txt` fails validation** — Lighthouse flags `Content-Signal:` as an unknown directive (line 46). Note `use=reference` isn't one of the three defined signals and will be ignored, and `ai-train=yes` grants training rights, which is orthogonal to being cited and worth deciding deliberately.
- **The CA host doesn't get the robots.txt protection the US host gets** — `_middleware.js:214` serves robots from the Pages Function for US hosts only, specifically to pre-empt Cloudflare Managed robots injection.
- **A guide title claims testing that the site's own policy disclaims.** `best-pickleball-paddles-2026` is titled *"**Tested** Picks for Every Level"* while its methodology says *"we avoided inventing lab numbers we do not have"* and `/about` commits to *"say so instead of inventing 'tested' language."* An AI comparing headline to body finds a direct contradiction.
- **Price display lacks an "as of" date.** The "approximate / not live" hedging is right, but the Operating Agreement expects a visible capture date on any specific figure. (Moot until C1 is fixed.)

---

## LOW

- `label-content-name-mismatch` — `<a class="site-logo" aria-label="US Pickleball Court home">` wraps stacked spans concatenating to `USPickleball Court`, which the accessible name doesn't contain.
- ~68 KiB unused JavaScript, entirely `googletagmanager.com/gtag/js` (350–670 ms).
- `/gear/paddles` DOM is 1,566 elements / 196 KB raw HTML.
- Five news articles run 301–341 words, of which ~135 is shared boilerplate, leaving ~170–190 words of reporting; none has a hero image.
- Four thin guides (apparel ≈527 words, accessories ≈540, bags ≈584, balls ≈633) against ~1,300 for the rest.
- 55 links across 17 guides use the raw URL path as anchor text, e.g. `[/gear/nets](/gear/nets)`.
- 62 internal anchors have no accessible text — all the author-avatar link.
- Rendered text defect on `/news`: *"that affect whatCanadian shoppers see"* — missing space from JSX whitespace handling.
- A quotable typo inside FAQPage JSON-LD: *"…approximate catalog references. always check the current price on the store."*
- Breadcrumb labels are raw lowercase slugs (`"name":"paddles"`).
- `/news` pagination reads `Astro.url.searchParams` at build time, so `?page=2` returns page 1. Masked today (page size 20, 10 entries); will break silently past 20.
- `RegionGate` auto-opens a modal on first visit and sets `overflow-hidden` on `<html>` — JS-rendering crawlers see an interstitial over the content.
- IndexNow is manual: `scripts/ping-indexnow.mjs` exists, but there is no `.github/workflows`, so nothing pings on deploy.
- `.cursorrules` mandates `tag=thepickleb050-20`, but the live US site correctly uses `tag=uspickleball-20`. The rule contradicts correct shipped behaviour.
- Cloudflare 403s generic script UAs (`Python-urllib`) on discovery files. Every real crawler tested — Googlebot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Bingbot, Amazonbot — returns 200. Noted so it isn't later mistaken for a block.

---

## What is working

- All 53 sitemap URLs return 200. **Zero** broken internal links, redirect chains, canonical mismatches, duplicate titles, or duplicate meta descriptions.
- Trailing-slash normalisation is clean: one 308 to the no-slash form, and on-page internal links already use no-slash.
- Visible affiliate compliance is solid — 22/22 Amazon links on the sampled guide carry the tag, `target="_blank"`, and `rel="sponsored nofollow noopener"`. Disclosure present top-of-body and in the footer on every page. `npm run qa:live:us` passes 9 routes.
- **No fabricated pricing in structured data** — zero `price`/`availability`/`aggregateRating` across 311 blocks, with the reasoning documented in code. This is the most common way affiliate sites get penalized and you avoided it deliberately.
- **0 JSON-LD parse errors in 311 blocks** on both variants, and the US rewrite leaks no `en-CA`, `areaServed:"CA"` or CA URLs into structured data. The hreflang-restore regexes at `_middleware.js:123-131` are careful work.
- `FAQPage` on 26 of 26 guides, backed by real visible `<details>` content and typed through the collection schema so it can't drift. `ComparisonTable` on 26/26 renders a semantic `<table>` with `<caption>` and `<th scope>` plus a mobile fallback. `ProsCons` on 26/26.
- All 341 `<img>` elements have `alt` and explicit `width`+`height`. No lazy-loaded LCP hero. Zero skipped heading levels anywhere.
- CLS is 0 on every page tested; TBT 10–60 ms; best practices 100.
- robots.txt allows every major AI crawler and blocks only bulk scrapers.
- Answer-first news leads are genuinely good — `selkirk-acquires-bread-and-butter` opens dated, named, attributed and quotable. `how-we-define-skill-tiers` and `pickleball-paddle-foam-cores-explained` explicitly bound what the site does and doesn't know, which is rare in affiliate content and exactly what grounding pipelines reward.

---

## Recommended order of work

1. **C1** — stop relabelling currency. Store per-market prices or drop to tier tokens. This is publishing wrong prices to shoppers, so it outranks everything else.
2. **C5 + C6 + C2** — move market filtering to build time via `getNewsForMarket()`, drop CA-only articles from the US build. Fixes the AI-crawler blind spot and the invented-facts problem together.
3. **C3 + C4** — delete hreflang, add `404.astro`. Small and isolated.
4. **C8** — repoint `Product.url` and `ItemList` URLs on-site. One line in two files; removes 163 unattributed affiliate URLs from machine-readable markup.
5. **H1** — remove the AvantLink script, self-host fonts. Largest available CWV win.
6. **C7** — deduplicate guide boilerplate; delete the 3–5× within-page repeats first, since that is mechanical.
7. **H3** — darken three colour tokens to clear AA.
8. **H4 + H5** — single `@graph` with `@id` anchors; generate `llms.txt` from the collections.
9. **H2, H6, H7, H8, H9** — titles, citations, `quickAnswer`, author identity, `reviewSchema()`.
10. **Then the architectural cleanup:** build `PUBLIC_SITE_REGION=us` directly and delete `rewriteForUs()`. This retires an entire class of bug and unlocks edge-cached HTML. Keep the CA zone redirect rule and the `.ca` registration as-is.

Items 1–4 are correctness and compliance. Items 5–10 are growth.

---

*Audit only. No application code changed. `{{ TODO: confirm }}` items introduced: none.*
