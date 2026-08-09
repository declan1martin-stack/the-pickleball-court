import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_NAME, SITE_URL } from '../../lib/seo';
import { getNewsForMarket, newsPath } from '../../lib/news';
import { MARKET_LABEL, site } from '../../lib/site';

export async function GET(context: APIContext) {
	const entries = await getNewsForMarket();

	return rss({
		title: `${SITE_NAME} News`,
		description: `Short ${MARKET_LABEL} pickleball industry updates — sponsor moves, paddle launches, and brand news.`,
		site: context.site ?? SITE_URL,
		trailingSlash: false,
		items: entries.map((entry) => ({
			title: entry.data.title,
			description: entry.data.summary,
			pubDate: entry.data.date,
			link: newsPath(entry),
			categories: entry.data.tags,
		})),
		customData: `<language>${site.inLanguage.toLowerCase()}</language>`,
	});
}
