import { getCollection, type CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'articles'>;

export async function getAllArticles(): Promise<ArticleEntry[]> {
	const articles = await getCollection('articles');
	return articles.sort(
		(a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
	);
}

export async function getFeaturedArticles(limit = 3): Promise<ArticleEntry[]> {
	const articles = await getAllArticles();
	const featured = articles.filter((article) => article.data.featured);
	return (featured.length > 0 ? featured : articles).slice(0, limit);
}

export async function getArticlesByCategory(
	category: ArticleEntry['data']['category'],
): Promise<ArticleEntry[]> {
	const articles = await getAllArticles();
	return articles.filter((article) => article.data.category === category);
}

/** Prefer shared tags, then same category; exclude current slug. */
export function getRelatedArticles(
	articles: ArticleEntry[],
	current: ArticleEntry,
	limit = 3,
): ArticleEntry[] {
	const tagSet = new Set(current.data.tags);
	const scored = articles
		.filter((article) => article.data.slug !== current.data.slug)
		.map((article) => {
			const sharedTags = article.data.tags.filter((tag) => tagSet.has(tag)).length;
			const sameCategory = article.data.category === current.data.category ? 2 : 0;
			return { article, score: sharedTags * 3 + sameCategory };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score || b.article.data.publishDate.valueOf() - a.article.data.publishDate.valueOf());

	const related = scored.map((item) => item.article);
	if (related.length >= limit) return related.slice(0, limit);

	const fallback = articles.filter(
		(article) =>
			article.data.slug !== current.data.slug &&
			!related.some((item) => item.data.slug === article.data.slug),
	);
	return [...related, ...fallback].slice(0, limit);
}

const GEAR_CATEGORIES = [
	'paddles',
	'shoes',
	'nets',
	'balls',
	'bags',
	'apparel',
	'accessories',
] as const;

export type GearCategory = (typeof GEAR_CATEGORIES)[number];

export function categoryPath(category: string): string | null {
	if ((GEAR_CATEGORIES as readonly string[]).includes(category)) {
		return `/gear/${category}`;
	}
	return '/guides';
}

export const CATEGORY_PILLARS: Partial<Record<GearCategory, { title: string; href: string }>> = {
	paddles: {
		title: 'How to Choose a Pickleball Paddle',
		href: '/guides/how-to-choose-a-pickleball-paddle',
	},
	shoes: {
		title: 'Best Pickleball Shoes (2026)',
		href: '/guides/best-pickleball-shoes-2026',
	},
	nets: {
		title: 'Best Portable Pickleball Nets (2026)',
		href: '/guides/best-portable-pickleball-nets-2026',
	},
};
