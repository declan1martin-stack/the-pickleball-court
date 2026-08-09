import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absoluteUrl } from '../lib/seo';
import { getNewsForMarket, newsPath } from '../lib/news';
import { AMAZON_LABEL, MARKET_LABEL, SITE_NAME, SITE_URL } from '../lib/site';

export const GET: APIRoute = async () => {
	const articles = (await getCollection('articles')).sort((a, b) =>
		a.data.title.localeCompare(b.data.title),
	);
	const news = await getNewsForMarket();
	const generated = new Date().toISOString().slice(0, 10);

	const guideLines = articles
		.map(
			(article) =>
				`- [${article.data.title}](${absoluteUrl(`/guides/${article.data.slug}`)}): ${article.data.description}`,
		)
		.join('\n');

	const newsLines = news
		.map(
			(entry) =>
				`- [${entry.data.title}](${absoluteUrl(newsPath(entry))}): ${entry.data.summary}`,
		)
		.join('\n');

	const body = `# ${SITE_NAME}

> ${MARKET_LABEL} pickleball gear guides and ${AMAZON_LABEL} product catalogs for paddles, shoes, nets, balls, bags, apparel, and accessories.

- [Home](${absoluteUrl('/')}): Site homepage
- [Affiliate disclosure](${absoluteUrl('/affiliate-disclosure')}): How affiliate links work
- [Editorial policy](${absoluteUrl('/editorial-policy')}): How we research and write guides

## Purpose

Honest, high-intent buying guidance for ${MARKET_LABEL} players. Product data lives in a curated catalog; guides reference catalog items only. Prices are shown as approximate $–$$$$$ tiers ($≤50, $$≤75, $$$≤100, $$$$≤150, $$$$$>150) — always confirm live pricing on ${AMAZON_LABEL}. Affiliate links may earn us a commission from qualifying purchases.

## Main sections

- [Guides hub](${absoluteUrl('/guides')}): All buying guides
- [Gear — paddles](${absoluteUrl('/gear/paddles')}): Paddle catalog
- [Gear — shoes](${absoluteUrl('/gear/shoes')}): Court shoes
- [Gear — nets](${absoluteUrl('/gear/nets')}): Portable nets
- [Gear — balls](${absoluteUrl('/gear/balls')}): Indoor and outdoor balls
- [Gear — bags](${absoluteUrl('/gear/bags')}): Bags and backpacks
- [Gear — apparel](${absoluteUrl('/gear/apparel')}): Court apparel
- [Gear — accessories](${absoluteUrl('/gear/accessories')}): Grips, tape, and small upgrades
- [News](${absoluteUrl('/news')}): Weekly roundups and gear updates
- [News RSS](${absoluteUrl('/news/feed.xml')}): News feed
- [Guides RSS](${absoluteUrl('/rss.xml')}): Guides feed

## Guides

${guideLines}

## News & weekly updates

${newsLines}

## Trust & legal

- [About](${absoluteUrl('/about')})
- [Editorial policy](${absoluteUrl('/editorial-policy')})
- [Privacy](${absoluteUrl('/privacy')})
- [Terms](${absoluteUrl('/terms')})
- [Contact](${absoluteUrl('/contact')})
- [Author — Declan Martin](${absoluteUrl('/authors/declan-martin')})
- [Sitemap](${absoluteUrl('/sitemap-index.xml')})

## Notes for crawlers

Content is statically generated (Astro SSG). Key pages are HTML without requiring JavaScript to read the main copy. Affiliate outbound links use rel="sponsored nofollow noopener". Prefer the apex host ${SITE_URL.replace(/\/$/, '')} (no www).

Last generated: ${generated}
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
