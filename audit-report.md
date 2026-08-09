# Traffic Collapse Audit — uspickleballcourt.com + thepickleballcourt.ca

**Date:** 2026-08-08  
**Scope:** Audit only (no code changes).  
**Repo reality:** There is **one** git repo (`the-pickleball-court`), not two. Both hostnames are served from the same Astro codebase. Production uses a shared Cloudflare Pages deploy: CA HTML is built with `PUBLIC_SITE_REGION=ca`, and `functions/_middleware.js` rewrites response bodies for `uspickleballcourt.com`. Findings are labeled `[US]`, `[CA]`, or `[BOTH]`.

**Symptom context:** Organic sessions reportedly fell from ~100 to 1–2. This audit evaluates indexation blockers, tracking, and (especially) cross-host duplication.

---

## 1. Blockers

Anything that would **actively prevent indexing**. Highest priority first.

### 1.1 Near-duplicate dual-host site (primary organic-risk finding) — `[BOTH]`

Not a classic `noindex` / robots block — but the strongest explanation for organic collapse / suppression.

| Check | Result |
|---|---|
| Architecture | Same pages, same slugs, same bodies with light CA↔US string swaps |
| Build-time similarity (`build:ca` vs `build:us`) | **51 / 53** page pairs ≥70% similar; almost all guides **98–99.5%** |
| Live similarity (middleware-served US vs live CA) | Homepage **91.9%**; best paddles **98.9%**; shoes **93.4%**; paddles hub **97.1%**; rules **98.9%**; about only **47.2%** (more rewritten) |
| H1 identical (build compare) | **Yes** for nearly all guide/news pages |
| Meta description identical (build compare) | **Yes** for nearly all guide pages |

Google is almost certainly treating the two hosts as **near-duplicate English sites**. With reciprocal hreflang present, Google still typically consolidates / demotes one host. That matches “~100 → 1–2 organic sessions” far better than a missing GA tag.

**Full similarity table (build:ca vs build:us body text):**

| Slug | Exists US | Exists CA | Approx. body similarity | H1 identical? | Meta description identical? |
|---|---|---|---:|---|---|
| `index.html` | Y | Y | 92.7% | N | N |
| `guides/best-pickleball-paddles-2026/` | Y | Y | 99.4% | Y | Y |
| `guides/best-pickleball-paddles-for-beginners/` | Y | Y | 99.4% | Y | Y |
| `guides/best-pickleball-shoes-2026/` | Y | Y | 99.4% | Y | Y |
| `guides/skechers-vs-asics-pickleball/` | Y | Y | 99.4% | Y | Y |
| `guides/pickleball-paddle-foam-cores-explained/` | Y | Y | 99.5% | Y | Y |
| `guides/how-to-choose-a-pickleball-paddle/` | Y | Y | 99.3% | Y | Y |
| `guides/pickleball-rules-for-beginners/` | Y | Y | 99.3% | Y | Y |
| *(all other `/guides/*` content pages)* | Y | Y | 98.9–99.3% | Y | Y |
| `gear/paddles/` | Y | Y | 97.4% | N | N |
| `gear/shoes/` | Y | Y | 96.6% | N | N |
| `gear/*` (other categories) | Y | Y | 87.6–91.0% | mostly N | mostly N |
| `news/*` (shared) | Y | Y | 98.6–99.3% | Y | Y |
| `about/` | Y | Y | 22.1% | N | N |
| `editorial-policy/` | Y | Y | 26.2% | Y | Y |
| `contact/` | Y | Y | 73.7% | Y | N |
| Verification HTML files | Y | Y | 100% | Y | Y |

**Count of page pairs over 70% similarity: 51** (of 53 comparable files).

### 1.2 Classic indexation blockers — **not found**

| Check | `[CA]` | `[US]` |
|---|---|---|
| `robots.txt` `Disallow: /` on content | **No** — `User-agent: *` → `Allow: /` | **No** — same pattern; sitemap points at US host |
| `meta robots` noindex on content | **None** in `src/` or `dist/` HTML | **None** (live + build) |
| Live `robots` content | `index,follow,max-image-preview:large` | Same |
| `public/_headers` / `X-Robots-Tag` | **Missing file** — no X-Robots-Tag | Same (shared repo) |
| Password / Cloudflare Access in-repo | **None** (`wrangler.toml` absent; no auth rules in `_redirects`) | Same |
| Cross-domain canonical (US → CA or CA → US) | **No** — CA pages canonical to `thepickleballcourt.ca` | **No** — US pages canonical to `uspickleballcourt.com` |

### 1.3 `robots.txt` details — `[BOTH]`

Source: `src/pages/robots.txt.ts` (not `public/robots.txt`).

Live CA sitemap lines:

```
Sitemap: https://thepickleballcourt.ca/sitemap-index.xml
Sitemap: https://thepickleballcourt.ca/sitemap.xml
```

Live US sitemap lines:

```
Sitemap: https://uspickleballcourt.com/sitemap-index.xml
Sitemap: https://uspickleballcourt.com/sitemap.xml
```

Bulk scrapers blocked only: Bytespider, CCBot, meta-externalagent. AI/search bots allowed. **Not a crawl block for Googlebot.**

### 1.4 Soft blocker: trailing-slash split — `[BOTH]`

| Source | Trailing slash |
|---|---|
| Sitemap URLs | Almost all **with** `/` (e.g. `.../guides/best-pickleball-paddles-2026/`) |
| `<link rel="canonical">` | Almost all **without** `/` (e.g. `.../guides/best-pickleball-paddles-2026`) |
| `trailingSlash` in `astro.config.mjs` | **Unset** (Astro default) |

This splits signals between slash/no-slash variants. Not a hard noindex, but it is crawl/index hygiene debt.

---

## 2. Tracking

### 2.1 GA4 tag location — `[BOTH]`

| Item | Finding |
|---|---|
| Measurement ID | `G-JWSBZJ6R4P` |
| Source file | `src/components/Analytics.astro` (only source occurrence) |
| Inheritance | Included once from shared `src/layouts/Layout.astro` `<head>` via `<Analytics />` — every Layout page inherits it |
| Inside `<head>`? | **Yes** |
| Same ID on both hosts? | **Yes** (shared property) |

Condition wrapping the tag (verbatim):

```astro
{gaId && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
    <script is:inline define:vars={{ gaId }}>
```

Where:

```ts
const gaId = import.meta.env.PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-JWSBZJ6R4P';
```

- **Not** wrapped in `import.meta.env.PROD` / `MODE` checks.
- **No** consent / cookie-banner gate in Analytics.
- Because of the hardcoded fallback, `gaId` is effectively always truthy in production builds.

### 2.2 `is:inline` status — `[BOTH]`

| Script | `is:inline`? | Notes |
|---|---|---|
| Inline config (`gtag('config', ...)`) | **Yes** | Correct |
| Loader `<script async src="https://www.googletagmanager.com/gtag/js?id=...">` | **No** | Flagged per task criteria. In practice Astro left the external `src` tag unbundled in `dist/` (still a plain async loader). Lower risk than a missing `is:inline` on the inline config. |

### 2.3 Streams / blending — `[BOTH]`

Comments in `Analytics.astro` explicitly state both hostnames share one property; runtime sets:

- `user_properties.site_region` = `ca` | `us`
- event/config params `site_region`, `site_hostname`

**Implication:** If GA4 Admin does **not** have `site_region` / `site_hostname` registered as custom dimensions, the UI will look like one blended property and “US vs CA organic” cannot be read cleanly. There is **no evidence of separate GA4 data streams per hostname in code** — only one measurement ID.

### 2.4 Build coverage — `[BOTH]` (CA and US builds identical coverage)

| Metric | Value |
|---|---|
| HTML files in `dist/` | 53 |
| Containing `G-JWSBZJ6R4P` / gtag loader | **51** |
| Missing tag | `avantlink-verify.html`, `googlee46d51aeb5df66be.html` (verification stubs — expected) |
| Content pages coverage | **100%** of Layout-rendered pages |
| `gtag` occurrences in `dist/index.html` | 11 (loader + config + event wiring) |

Live check: GA ID present on sampled CA and US URLs (homepage, guides, gear, news).

**Tracking is unlikely to be the root cause of an organic drop from ~100 → 1–2.** It can mis-report region mix, but pages are tagged.

---

## 3. Duplication

### 3.1 Content inventory — `[BOTH]`

| Area | Count |
|---|---:|
| Articles (`src/content/articles`) | 26 |
| News (`src/content/news`) | 8 |
| Page routes (`src/pages/**`) | 16 route modules (guides/news/gear dynamic) |
| Built content HTML routes | 51 sitemap URLs per host |

Every public content slug exists on **both** hosts (shared build + middleware, or `build:us`).

### 3.2 Similarity summary

- **51 pairs ≥ 70%** body similarity (build compare).
- Live middleware US is still **~92–99%** similar on money pages.
- Canonicals are **self-host** (good), hreflang is **reciprocal** (good), but content differentiation is **insufficient**.

### 3.3 Hreflang — `[BOTH]`

Emitted on every Layout page:

- `en-CA` → `https://thepickleballcourt.ca{path}`
- `en-US` → `https://uspickleballcourt.com{path}`
- `x-default` → CA

Middleware restores CA/`x-default` after host rewrite so US responses keep correct alternates. **Hreflang exists;** it does not fix thin localization.

---

## 4. Hygiene

### 4.1 Sitemap — `[BOTH]`

| Check | `[CA]` | `[US]` |
|---|---|---|
| `@astrojs/sitemap` installed | Yes (`package.json`) | Yes (same) |
| Registered in `astro.config.mjs` | Yes + `lastmod` serialize | Yes (`site` switches with `PUBLIC_SITE_REGION`) |
| `site:` config | `https://thepickleballcourt.ca` (default/ca) | `https://uspickleballcourt.com` when `PUBLIC_SITE_REGION=us` |
| URL count | 51 | 51 |
| Wrong domain in sitemap | 0 | 0 |
| Built pages missing from sitemap | 0 | 0 |
| HTTPS | Yes | Yes |

First sitemap URLs (CA build) start with `/`, `/about/`, `/affiliate-disclosure/`, `/authors/declan-martin/`, `/contact/`, `/editorial-policy/`, `/gear/*`, `/guides/*` … (full list in build artifact `dist/sitemap-0.xml`).

### 4.2 Redirects / routing — `[BOTH]`

`public/_redirects` (full):

```
# Cloudflare Pages redirects
/sitemap.xml    /sitemap-index.xml    301
```

- No catch-all / wildcard content redirect.
- Middleware adds **www → apex 301** for both hosts (verified live).
- `dist/` is **gitignored** and **not committed** (`git ls-files dist` = 0). Not a stale committed root cause.
- `dist/index.html` regenerates on build.

### 4.3 SEO baseline gaps — `[BOTH]` (from CA build; US mirrors structure)

**No missing titles** on content pages. **No duplicate titles** across pages.

Flags:

| Issue | Pages |
|---|---|
| **0 H1** | `/authors/declan-martin` |
| **Thin &lt;600 words** | `/about`, `/affiliate-disclosure`, `/contact`, `/editorial-policy`, `/privacy`, `/terms`, `/gear/apparel`, and short news: Anna Leigh Waters, Engage X2, JOOLA Pro V, Li-Ning, Selkirk B&B |
| **Title &gt;60 chars** (after format) | Several guides (carbon-fiber, how-to-choose, accessories, guides hub, one news title) |
| **Meta desc &gt;155** | Author page, some gear hubs (clamped inconsistently in display) |
| News OG fallback | Some news use `/favicon.svg` when no `heroImage` (weak social/snippet image) |

Representative page table (CA canonicals; US is the same path on `uspickleballcourt.com`):

| URL | Title length | Meta desc present | Meta desc length | H1 count | Word count | Canonical host |
|---|---:|---|---:|---:|---:|---|
| `/` | 55 | Y | 129 | 1 | 1462 | own |
| `/guides/best-pickleball-paddles-2026` | 60 | Y | 137 | 1 | 2522 | own |
| `/guides/how-to-choose-a-pickleball-paddle` | 63 | Y | 131 | 1 | 2228 | own |
| `/gear/paddles` | 57 | Y | 155 | 1 | 4235 | own |
| `/news` | 53 | Y | 110 | 1 | 705 | own |
| `/about` | 27 | Y | 121 | 1 | 412 | own |
| `/authors/declan-martin` | 51 | Y | 159 | **0** | 1568 | own |
| `/contact` | 31 | Y | 87 | 1 | 267 | own |

(Full 51-row extract generated during audit; values above are representative.)

### 4.4 Misc hygiene notes — `[BOTH]`

- Temporary **AvantLink** verification script in `Layout.astro` head uses `http://` (mixed content). Not an index blocker; should be removed after approval.
- Affiliate links correctly use `rel="sponsored nofollow noopener"` (outbound only — does not nofollow the site itself).

---

## 5. Proposed fix order

Ranked by impact on recovering organic traffic. **Do not implement in this audit pass.**

1. **Highest impact — Deduplicate or differentiate the two hosts** `[BOTH]`  
   Pick one strategy:
   - **A.** Make US a true locale (substantial unique intros, local inventory/pricing narrative, US-only guides, different title/H1 patterns), not middleware synonym swaps; **or**
   - **B.** Consolidate to one indexable host and `301` the other (or noindex the subordinate host while keeping hreflang only if content is truly localized).  
   Current ~99% overlap on money pages will keep organic suppressed even if technical SEO is perfect.

2. **Normalize trailing slash** `[BOTH]`  
   Set `trailingSlash: 'always'` (or `'never'`) in Astro and make canonical + sitemap + internal links agree. Eliminates split URL equity.

3. **GA4 reporting hygiene** `[BOTH]`  
   Confirm custom dimensions `site_region` + `site_hostname` in GA4 Admin; optionally split data streams per hostname so a future organic drop can be diagnosed by host. Add `is:inline` to the gtag.js loader for Astro safety.

4. **Thin / weak URL cleanup** `[BOTH]`  
   Expand or `noindex` thin trust pages if they shouldn’t compete; fix author H1; ensure news posts used for discovery have hero images + ≥600 words where they target queries.

5. **Off-site / GSC ops** `[CA]` `[US]`  
   Re-verify US Search Console property coverage, inspect index status for top money URLs, resubmit sitemaps after slash normalization. (Ops, not code — but required to validate recovery.)

---

## 6. Bottom line

| Hypothesis | Verdict |
|---|---|
| GA4 tag removed / broken | **Unlikely** — tag present sitewide on both hosts |
| robots / noindex / X-Robots-Tag | **Not found** |
| US canonicalizing to CA (or reverse) | **Not found** — self-canonicals + hreflang OK |
| Cross-host near-duplicate content | **Confirmed — dominant issue** (51 pairs &gt;70%; live guides ~92–99%) |
| Trailing-slash / thin pages | Real hygiene issues; secondary |

**Most likely cause of the organic collapse:** Google consolidating or suppressing one/both hosts after the US mirror launched as near-duplicate content of the CA site, not a hard indexation kill switch in robots/meta.

---

*End of audit. No code was changed in this pass.*
