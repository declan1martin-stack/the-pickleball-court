import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_URL, SITE_NAME } from '../lib/seo';

export async function GET(context) {
	const articles = await getCollection('articles');
	const sorted = articles.sort(
		(a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
	);

	return rss({
		title: `${SITE_NAME} Guides`,
		description:
			'Canadian pickleball buying guides, comparisons, and rules explainers for paddles, shoes, and portable nets.',
		site: context.site ?? SITE_URL,
		items: sorted.map((article) => ({
			title: article.data.title,
			description: article.data.description,
			pubDate: article.data.publishDate,
			link: `/guides/${article.data.slug}/`,
			categories: [article.data.category, article.data.type, ...article.data.tags],
		})),
		customData: `<language>en-ca</language>`,
	});
}
