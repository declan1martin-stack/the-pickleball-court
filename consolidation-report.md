# Consolidation Report — CA → US (Section 4)

**Date:** 2026-08-08  
**Decision:** `uspickleballcourt.com` is the indexable host. `thepickleballcourt.ca` is a 301 redirect layer via a **zone-level Cloudflare Redirect Rule** (not `public/_redirects`).

---

## Redirect rule (deployed)

| Field | Value |
|---|---|
| Zone | `thepickleballcourt.ca` (Proxied confirmed) |
| Rule name | `CA to US consolidation 301` |
| Match | Hostname equals `thepickleballcourt.ca` **OR** `www.thepickleballcourt.ca` |
| Type | Dynamic |
| Expression | `concat("https://uspickleballcourt.com", http.request.uri.path)` |
| Status | **301** |
| Preserve query string | **On** |

Also deployed: `trailingSlash: 'never'` + `build.format: 'file'` (`a86597e`) so US no longer 308-adds a trailing slash on money URLs.

---

## Curl results — redirect-map.csv (51 URLs)

**Pass: 51 / 51**

Every CA URL from `redirect-map.csv`:
- Exactly **one** `301` → then `200`
- `Location` = identical slug on `https://uspickleballcourt.com…` with **no** trailing slash (homepage apex has no trailing slash either)
- No multi-301 chains on these paths

### US host (must stay up)

| URL | Result |
|---|---|
| `https://uspickleballcourt.com/` | **200** |
| `https://uspickleballcourt.com/guides/best-pickleball-paddles-2026` | **200** |

Rule is correctly scoped to the `.ca` zone only.

---

## Residual chains — fixed

| Case | Before | After |
|---|---|---|
| `www.thepickleballcourt.ca/…` | 2× 301 | **1× 301** — disabled **www to apex**; consolidation matches `www` |
| Trailing-slash CA/www URLs | 301 + US 308 | **1× 301** to no-slash US — Wildcard `…/*/` → `us…/${1}` above consolidation |

Active rule order (top → bottom): `CA trailing-slash to US` → `www CA trailing-slash to US` → `CA to US consolidation 301`. `www to apex` disabled.

---

## Redirect map summary (from Section 1)

| Match type | Count |
|---|---:|
| exact-slug | 51 |
| renamed-slug | 0 |
| no-equivalent | 0 |
| PORT-FIRST | 0 |

---

## Search Console Change of Address

**Not completed in this pass.** Requires:
1. `uspickleballcourt.com` verified as a GSC property
2. Human sign-in to CA property → Settings → Change of Address → select US destination

Do this only after the 51-URL curl pass (already green).

---

## Leave alone (confirmed)

- CA sitemap still redirects via the zone rule — fine
- `/news/ca-roundup-…` kept as exact-slug
- `/*/ → /:splat` in shared `_redirects` kept for US slash normalization
- CA `robots.txt` remains crawlable (no `Disallow: /`)
- `.ca` domain must remain registered and Proxied

---

## Sections 5–6 status

Not started in this pass (affiliate conversion + audit cleanup). Ready when you say go.

---

## Bottom line

Zone rules live. **51/51** map URLs, www, and trailing-slash variants are single-hop 301 → US. US host **200**. Remaining human step: GSC Change of Address once US property is verified.
