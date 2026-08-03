import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE_REGION, type SiteRegion } from './site';

export type NewsEntry = CollectionEntry<'news'>;

export const NEWS_PAGE_SIZE = 20;

export async function getAllNews(): Promise<NewsEntry[]> {
	const entries = await getCollection('news');
	return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Optional market filter for dual-region builds.
 * Shared CA+middleware deploys should keep using getAllNews() so both hosts
 * receive every entry (middleware cannot swap which cards are in the HTML).
 */
export async function getNewsForMarket(region: SiteRegion = SITE_REGION): Promise<NewsEntry[]> {
	const entries = await getAllNews();
	return entries.filter((entry) => {
		const markets = entry.data.markets ?? (['ca', 'us'] as const);
		return markets.includes(region);
	});
}

export async function getLatestNews(limit = 3): Promise<NewsEntry[]> {
	const entries = await getAllNews();
	return entries.slice(0, limit);
}

export function newsSlug(entry: NewsEntry): string {
	return entry.id.replace(/\.(md|mdx)$/i, '');
}

export function newsPath(entry: NewsEntry): string {
	return `/news/${newsSlug(entry)}`;
}

/** Format news dates in UTC so calendar days match frontmatter. */
export function formatNewsDate(
	date: Date,
	options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	},
): string {
	return date.toLocaleDateString('en-CA', { timeZone: 'UTC', ...options });
}
