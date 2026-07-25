# Site-Wide Compliance, QA & Crawlability Pass — 2026-07-25

Property: https://thepickleballcourt.ca/  
Tag: `thepickleb050-20`

---

## Task 1 — Amazon Affiliate Compliance

| Metric | Result |
|---|---|
| Products checked | **64** (was 65; see Task 3 fix) |
| Catalog tag present | **64 / 64 PASS** |
| Built HTML `rel="sponsored nofollow noopener"` + `target="_blank"` | **PASS** (`npm run qa:affiliate`) |
| Hard failures (missing tag / missing rel) | **none** |

### Spot-check of outbound Amazon URLs

Sampled all balls/bags/apparel/accessories + sample paddles/shoes/nets.

| Status | Count / notes |
|---|---|
| Direct `/dp/` URLs resolving on amazon.ca | New-category SKUs + most catalog |
| Keyword `/s?` search URLs (still tagged amazon.ca) | **16 older SKUs** — work, but not locked to a single ASIN |
| Broken amazon.ca product page | **`apparel-baddle-skort` (B08VF5V411)** — **404 on amazon.ca** (still listed on amazon.com). **Removed from catalog.** |

### Failing / remediated product IDs

| Product ID | Issue | Action |
|---|---|---|
| `apparel-baddle-skort` | amazon.ca `/dp/B08VF5V411` returns 404 | Removed from `gear.json` + apparel guide |

### Soft notes (not compliance failures)

- **16 products** use Amazon.ca **search** URLs instead of `/dp/` ASINs (legacy paddles/shoes/nets). They include the Associates tag and open amazon.ca; upgrading to stable ASINs is a catalog hygiene follow-up, not a compliance break.
- Accessories do **not** include a “tac spray” SKU. Catalog has **Tourna Mega Tac overgrip** (`acc-tourna-mega-tac`), Franklin overgrips, edge guard tape, tungsten tape — matches live product pages.

---

## Task 2 — Cross-Links Into Existing Content

### Files edited (outbound links to new guides)

| File | Where links were added |
|---|---|
| `how-to-choose-a-pickleball-paddle.mdx` | Next reads → accessories + bags; cold-weather note → balls; Canadian travel note → overgrip + bags |
| `best-pickleball-paddles-for-beginners.mdx` | Keep learning → balls + accessories |
| `best-pickleball-paddles-2026.mdx` | How we chose → accessories; Canadian travel notes → bags + overgrip |
| `best-pickleball-shoes-2026.mdx` | Keep learning → bags + apparel |
| `best-portable-pickleball-nets-2026.mdx` | Keep learning → balls |
| `pickleball-rules-for-beginners.mdx` | Keep learning → balls |
| `pickleball-terms-glossary.mdx` | Keep learning → accessories + balls |
| `best-pickleball-gear-for-seniors.mdx` | Keep learning → apparel + accessories |
| `carbon-fiber-vs-fiberglass-paddles.mdx` | Keep learning → accessories |
| `pickleball-vs-tennis.mdx` | Keep learning → balls + apparel |

### New guides → existing content (already present; verified)

Balls/bags/apparel/accessories guides already link back to paddle/shoe/rules/gear hubs in their “Keep learning” sections.

---

## Task 3 — Catalog & Content QA

### Totals (after Baddle removal)

| Category | Count |
|---|---|
| paddles | 29 |
| shoes | 18 |
| nets | 4 |
| balls | 4 |
| bags | 3 |
| accessories | 4 |
| apparel | **2** |
| **Total** | **64** |

Task brief expected apparel **3** / total **65**. After removing the amazon.ca-404 Baddle skort, apparel is **2** and total is **64**. Replace with another amazon.ca-available apparel SKU if you want to restore 65.

### Accessories SKUs (live & categorized)

| ID | Name | Category | Notes |
|---|---|---|---|
| `acc-franklin-overgrip` | Franklin overgrips | accessories | OK |
| `acc-tourna-mega-tac` | Tourna Mega Tac **Overgrip** | accessories | OK — not a spray |
| `acc-edge-guard` | Edge guard tape | accessories | OK |
| `acc-tungsten-tape` | Tungsten tape | accessories | OK |

No duplicates. No miscategorization.

### Product field checks

- Local images under `/images/products/`: **PASS** (all 64)
- Affiliate URLs tagged: **PASS**
- Price tier `$` / `$$` / `$$$` (or legacy numeric): **PASS**
- Skill level mentioned in description: **48 / 64** — **16 soft gaps** (mostly legacy paddles/shoes/nets without “Skill level:” phrasing)

### Hub / guide click-through (build)

Built successfully (38 HTML content routes + verification file). New hubs and guides render with product cards / tables. Product JSON-LD now emitted per `ProductCard`.

---

## Task 4 — Findability & LLM Crawlability

### Search engine findability

| Check | Result |
|---|---|
| `sitemap-index.xml` includes 4 new hubs + 4 new guides | **PASS** |
| Sitemap URL count | **38** content URLs |
| Accidental `noindex` on content pages | **PASS** (none). Layout sets `index,follow` |
| Canonical tags unique | **PASS** for all Layout pages |
| Canonical missing | Only `googlee46d51aeb5df66be.html` verification file (expected; not a content page) |
| Orphan risk for new hubs/guides | **PASS** — nav/footer/homepage + gear pillars + cross-links |

### LLM / AI crawler access

#### `robots.txt` (repo `public/robots.txt`) — decided 2026-07-25

- **Allow:** GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, `*`
- **Disallow:** Amazonbot, Bytespider, CCBot, meta-externalagent
- Sitemap: `https://thepickleballcourt.ca/sitemap-index.xml`

**Deploy check:** Cloudflare may still inject managed AI-crawler Disallows on the live edge. After deploy, confirm `https://thepickleballcourt.ca/robots.txt` matches the repo and turn off conflicting Cloudflare AI-scraper / managed robots rules if GPTBot/ClaudeBot still show Disallow.

#### `llms.txt`

**Added** `public/llms.txt` summarizing purpose, hubs, pillar guides, and trust pages.

#### SSG / JS dependency

Astro static build — guide and gear copy is in HTML. Affiliate click analytics requires JS; content does not.

#### Structured data

| Type | Status |
|---|---|
| `Organization` | Present sitewide via Layout |
| `Article` | Present on guide pages |
| `FAQPage` | Present where FAQ component used |
| `BreadcrumbList` | Present via Breadcrumbs |
| `Product` | **Was missing on cards** → **fixed** this pass (`ProductCard` emits `productSchema`) |

---

## Fixes made directly

1. Removed `apparel-baddle-skort` (amazon.ca 404); updated apparel guide.
2. Added Product JSON-LD to `ProductCard.astro`.
3. Added `public/llms.txt`.
4. Cross-linked new guides from major existing articles.
5. Updated Organization schema description to include new categories.

---

## Needs human decision

1. ~~**AI crawlers:**~~ **Decided** — allow GPTBot / ClaudeBot / Google-Extended / Applebot-Extended; block Amazonbot / Bytespider / CCBot / meta-externalagent (see `public/robots.txt`). Still verify Cloudflare edge doesn’t override after deploy.
2. **Catalog count:** replace Baddle with another amazon.ca apparel SKU to return to 65, or accept apparel=2 / total=64.
3. **Optional hygiene:** convert 16 legacy Amazon **search** URLs to stable `/dp/` ASINs; add “Skill level:” lines to 16 older descriptions.
4. **Content debt:** several older MDX guides still contain repeated “Extra practical notes for Canadian players” boilerplate blocks — cleanup recommended separately.
