# CA custom domain 301 → US (dashboard-only)

**Status (2026-09-09):** Still live. `https://thepickleballcourt.ca/*` returns a Cloudflare **301** to the same path on `https://uspickleballcourt.com`. This is **not** fixable in the git repo.

**Owner:** Declan — Cloudflare Dashboard, zone `thepickleballcourt.ca`.

**Do not** add a repo `_redirects` / middleware “fix.” Those never run: the zone rule answers before the request reaches Pages.

---

## What is working

| Host | Result |
|---|---|
| `https://the-pickleball-court-ca.pages.dev` | **200**, CA build (`data-site="ca"`, tag `thepickleb050-20`, amazon.ca) |
| `https://the-pickleball-court.pages.dev` | **200**, US build (`data-site="us"`, tag `uspickleball-20`) |
| `https://uspickleballcourt.com` | **200**, US Pages project |
| `https://thepickleballcourt.ca` (apex + www) | **301** to US — intercepted at the **CA zone**, not Pages |

The CA Pages project (`the-pickleball-court-ca`, `npm run build:ca`) is healthy. The custom domain never reaches it.

---

## Root cause

A **zone-level Cloudflare Single Redirect** on `thepickleballcourt.ca` (deployed 2026-08-08 for the CA→US consolidation). Repo docs later said these were disabled; **live traffic shows they are still on.**

Documented in [`consolidation-report.md`](../consolidation-report.md):

| Rule name (expected) | Match | Target | Status |
|---|---|---|---|
| `CA trailing-slash to US` | `thepickleballcourt.ca/*/` | `https://uspickleballcourt.com/${1}` | 301 |
| `www CA trailing-slash to US` | `www.thepickleballcourt.ca/*/` | `https://uspickleballcourt.com/${1}` | 301 |
| `CA to US consolidation 301` | hostname is apex **or** www | `concat("https://uspickleballcourt.com", http.request.uri.path)` + preserve query | 301 |

Rule order (top → bottom): trailing-slash rules first, then the catch-all.

### Why this is the zone, not the repo

Probed 2026-09-09:

1. **Every path 301s**, including `/`, the starter kit, `/robots.txt`, `/sitemap-index.xml`, a made-up slug, and **`/go/us`**.
2. Query strings are preserved (`?utm=test` survives on the Location).
3. A trailing slash is stripped on the way to US — matches the dedicated trailing-slash rule, not `concat(..., uri.path)` alone.
4. The 301 body is Cloudflare’s generic redirect HTML (`<center>cloudflare</center>`). **No Pages headers** (`x-content-type-options`, `referrer-policy`, `permissions-policy`, `cf-cache-status`, `alt-svc`).
5. `public/_redirects` only has `/sitemap.xml → /sitemap-index.xml` and trailing-slash strip. It cannot send `.ca` → `.com`.
6. `functions/_middleware.js` only does www → **same-region** apex. It never 301s CA → US.
7. `functions/go/[region].js` returns **302** to the twin host. On `*.pages.dev` that works. On the CA custom domain, `/go/us` is **301** to `https://uspickleballcourt.com/go/us?next=…` — the zone rule fires first, so the Function never runs.
8. DNS: `thepickleballcourt.ca` NS is Cloudflare (`jobs.ns` / `stella.ns`); apex + www are **proxied** (orange-cloud anycast). Redirect Rules require that.

Collateral: `https://uspickleballcourt.com/go/ca?next=/…` correctly **302**s to `.ca`, then the zone **301**s back to `.com` (handoff ping-pong). After the rules are off, `/go/ca` and `/go/us` stay the only cross-host redirects.

---

## Dashboard steps (Declan)

Work in zone **`thepickleballcourt.ca`**. Do not edit `uspickleballcourt.com` redirects.

### 1. Turn off the consolidation Single Redirects

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com).
2. Open the **`thepickleballcourt.ca`** zone.
3. Go to **Rules → Redirect Rules** (or **Rules → Overview**, filter Redirect).
4. Disable or delete every rule that sends traffic to `uspickleballcourt.com`, including (names may vary):
   - `CA to US consolidation 301`
   - `CA trailing-slash to US`
   - `www CA trailing-slash to US`
5. Save / deploy. Changes are usually live in seconds.

If those names are gone, open each remaining Redirect Rule and check the **Target URL** / expression. Delete anything whose destination host is `uspickleballcourt.com`.

### 2. Check the other redirect surfaces (same zone)

If step 1 was already empty but curl still 301s, check these in **`thepickleballcourt.ca`**:

| Place | What to look for |
|---|---|
| **Rules → Bulk Redirects** | A list that maps `thepickleballcourt.ca/*` (or www) to `https://uspickleballcourt.com/…` |
| **Rules → Page Rules** (legacy) | *Forwarding URL* 301/302 to the US host |
| **Workers Routes** | A route on `thepickleballcourt.ca/*` or `www…/*` that redirects |
| **Rules → Snippets** | A snippet that 301s to US |
| Account-level **Bulk Redirects** | Same mapping, attached to this zone |

Leave **www → apex** alone if it only targets `https://thepickleballcourt.ca` (same host). Repo middleware already 301s www → apex after the request reaches Pages.

### 3. Confirm the custom domain is on the CA Pages project

1. **Workers & Pages → Pages → `the-pickleball-court-ca` → Custom domains**
   - Must include `thepickleballcourt.ca`.
   - `www.thepickleballcourt.ca` is optional; if present, middleware 301s www → apex.
2. **Workers & Pages → Pages → `the-pickleball-court` (US) → Custom domains**
   - Must **not** list `thepickleballcourt.ca` or `www.thepickleballcourt.ca`.
   - If they appear on the US project, remove them, then re-add them only on `the-pickleball-court-ca`.

If the domain is missing on the CA project: **Set up a custom domain** → enter `thepickleballcourt.ca` and follow the DNS prompts (Cloudflare will CNAME-flatten / attach the zone to this Pages project).

### 4. Confirm DNS stays on the CA project

**thepickleballcourt.ca → DNS → Records** (proxied / orange cloud):

| Record | Expected |
|---|---|
| Apex (`@` / `thepickleballcourt.ca`) | Proxied. CNAME flattened to `the-pickleball-court-ca.pages.dev`, **or** the A/AAAA Pages created when the custom domain was added. |
| `www` | Proxied. CNAME to the apex or to `the-pickleball-court-ca.pages.dev`. |

Do **not** point CA DNS at `the-pickleball-court.pages.dev` (US project).

SSL/TLS: **Full (strict)** is fine for Pages. Do not put the zone in “Redirect all requests to HTTPS” *plus* a host rewrite to US.

---

## Verify after the dashboard change

From any machine (no login). Expect **200** on the custom domain, not 301.

```bash
# Must be 200 — Pages headers present (x-content-type-options, etc.)
curl -sI "https://thepickleballcourt.ca/guides/fall-league-pickleball-starter-kit"

# CA build markers
curl -sL "https://thepickleballcourt.ca/guides/fall-league-pickleball-starter-kit" \
  | grep -E 'data-site=|thepickleb050-20|uspickleball-20|rel="canonical"'

# Expect:
#   <html … data-site="ca">
#   thepickleb050-20 on Amazon.ca URLs
#   no uspickleball-20
#   canonical https://thepickleballcourt.ca/guides/fall-league-pickleball-starter-kit

# Twin handoff — this 302 is intentional
curl -sI "https://thepickleballcourt.ca/go/us?next=/guides/fall-league-pickleball-starter-kit"
# Expect: 302  Location: https://uspickleballcourt.com/guides/fall-league-pickleball-starter-kit

# www → CA apex only (not US)
curl -sI "https://www.thepickleballcourt.ca/guides/fall-league-pickleball-starter-kit"
# Expect: 301  Location: https://thepickleballcourt.ca/guides/fall-league-pickleball-starter-kit
```

Optional: `npm run qa:live:ca` (follows redirects today, so it is **green even while the 301 is live** — it audits the US page. Re-run only after curl shows 200 on `.ca`).

Reference CA HTML (already correct):

`https://the-pickleball-court-ca.pages.dev/guides/fall-league-pickleball-starter-kit`

---

## What not to change in git

- Do not add `_redirects` from `.ca` to `.com` (or the reverse).
- Do not teach `_middleware.js` to 301 CA → US.
- Keep `/go/us` and `/go/ca` as the only twin-host handoff (`functions/go/[region].js`, **302**).

Once curl on `thepickleballcourt.ca` returns **200** + `data-site="ca"`, update the status line at the top of this file and in [`GSC_CHANGE_OF_ADDRESS.md`](./GSC_CHANGE_OF_ADDRESS.md).
