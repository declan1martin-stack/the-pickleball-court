import type { APIRoute } from 'astro';
import { AMAZON_LABEL, MARKET_LABEL, SITE_NAME, SITE_URL } from '../lib/site';

const body = `# ${SITE_NAME}

> ${MARKET_LABEL} pickleball gear guides and ${AMAZON_LABEL} product catalogs for paddles, shoes, nets, balls, bags, apparel, and accessories.

Site: ${SITE_URL}/
Affiliate disclosure: ${SITE_URL}/affiliate-disclosure
Editorial policy: ${SITE_URL}/editorial-policy

## Purpose

Honest, high-intent buying guidance for ${MARKET_LABEL} players. Product data lives in a curated catalog; guides reference catalog items only. Prices are shown as approximate $–$$$$$ tiers ($≤50, $$≤75, $$$≤100, $$$$≤150, $$$$$>150) — always confirm live pricing on ${AMAZON_LABEL}. As an Amazon Associate we earn from qualifying purchases.

## Main sections

- Home: ${SITE_URL}/
- Guides hub: ${SITE_URL}/guides/
- Gear — paddles: ${SITE_URL}/gear/paddles/
- Gear — shoes: ${SITE_URL}/gear/shoes/
- Gear — nets: ${SITE_URL}/gear/nets/
- Gear — balls: ${SITE_URL}/gear/balls/
- Gear — bags: ${SITE_URL}/gear/bags/
- Gear — apparel: ${SITE_URL}/gear/apparel/
- Gear — accessories: ${SITE_URL}/gear/accessories/

## Pillar guides

- How to choose a paddle: ${SITE_URL}/guides/how-to-choose-a-pickleball-paddle/
- Best paddles 2026: ${SITE_URL}/guides/best-pickleball-paddles-2026/
- Best shoes 2026: ${SITE_URL}/guides/best-pickleball-shoes-2026/
- Best portable nets 2026: ${SITE_URL}/guides/best-portable-pickleball-nets-2026/
- Balls indoor vs outdoor: ${SITE_URL}/guides/pickleball-balls-buying-guide/
- Bags by style: ${SITE_URL}/guides/pickleball-bags-buying-guide/
- Apparel essentials: ${SITE_URL}/guides/pickleball-apparel-buying-guide/
- Accessories (grips & tape): ${SITE_URL}/guides/pickleball-accessories-buying-guide/
- Rules for beginners: ${SITE_URL}/guides/pickleball-rules-for-beginners/
- Terms glossary: ${SITE_URL}/guides/pickleball-terms-glossary/

## Trust & legal

- About: ${SITE_URL}/about/
- Privacy: ${SITE_URL}/privacy/
- Terms: ${SITE_URL}/terms/
- Contact: ${SITE_URL}/contact/
- RSS: ${SITE_URL}/rss.xml
- Sitemap: ${SITE_URL}/sitemap-index.xml

## Notes for crawlers

Content is statically generated (Astro SSG). Key pages are HTML without requiring JavaScript to read the main copy. Affiliate outbound links use rel="sponsored nofollow noopener".
`;

export const GET: APIRoute = () =>
	new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
