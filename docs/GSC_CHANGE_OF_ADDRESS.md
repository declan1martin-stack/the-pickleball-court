# Google Search Console — Change of Address (CA → US)

**Status:** Requires a human Google account that owns both properties. Cannot be completed by deploy automation.

## Prerequisites

1. `uspickleballcourt.com` verified as a GSC property (Domain or URL-prefix).
2. `thepickleballcourt.ca` verified as a GSC property.
3. Production confirms:
   - Every `.ca` URL **301**s to the same path on `https://uspickleballcourt.com` (zone redirect).
   - US host returns **200** on money URLs.
   - US sitemap is submitted: `https://uspickleballcourt.com/sitemap-index.xml`

## Steps

1. Open Google Search Console → property **thepickleballcourt.ca**.
2. Settings (gear) → **Change of address**.
3. Select destination property **uspickleballcourt.com**.
4. Validate / confirm. Google will check that redirects are in place.
5. Keep the `.ca` domain registered and Proxied for at least **180 days** while equity moves.
6. In the US property: submit `sitemap-index.xml` and use URL Inspection on `/`, `/guides/best-pickleball-paddles-2026`, `/gear/paddles`, `/news`.

## Do not

- Drop the `.ca` registration or DNS while Change of Address is pending.
- Re-enable dual indexable hosts (no self-canonical CA site).
- Add hreflang pointing at the redirected `.ca` host.
