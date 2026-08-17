import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE_REGION, type SiteRegion } from './site';

export type NewsEntry = CollectionEntry<'news'>;

export const NEWS_PAGE_SIZE = 20;

export async function getAllNews(): Promise<NewsEntry[]> {
	const entries = await getCollection('news');
	return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Market-filtered news for the active SITE_REGION (ca or us build). */
export async function getNewsForMarket(region: SiteRegion = SITE_REGION): Promise<NewsEntry[]> {
	const entries = await getAllNews();
	return entries.filter((entry) => {
		const markets = entry.data.markets ?? (['ca', 'us'] as const);
		return markets.includes(region);
	});
}

export async function getLatestNews(limit = 3): Promise<NewsEntry[]> {
	const entries = await getNewsForMarket();
	return entries.slice(0, limit);
}

export function newsSlug(entry: NewsEntry): string {
	return entry.id.replace(/\.(md|mdx)$/i, '');
}

export function newsPath(entry: NewsEntry): string {
	return `/news/${newsSlug(entry)}`;
}

/** Prefer shared tags / same type, then newest — exclude current entry. */
export function getRelatedNews(
	entries: NewsEntry[],
	current: NewsEntry,
	limit = 3,
): NewsEntry[] {
	const tagSet = new Set(current.data.tags.map((tag) => tag.toLowerCase()));
	const currentSlug = newsSlug(current);
	const scored = entries
		.filter((entry) => newsSlug(entry) !== currentSlug)
		.map((entry) => {
			const sharedTags = entry.data.tags.filter((tag) => tagSet.has(tag.toLowerCase())).length;
			const sameType = entry.data.type === current.data.type ? 2 : 0;
			const roundupBoost = entry.data.type === 'roundup' ? 1 : 0;
			return {
				entry,
				score: sharedTags * 3 + sameType + roundupBoost,
			};
		})
		.sort(
			(a, b) =>
				b.score - a.score || b.entry.data.date.valueOf() - a.entry.data.date.valueOf(),
		);

	const related = scored.filter((item) => item.score > 0).map((item) => item.entry);
	if (related.length >= limit) return related.slice(0, limit);

	const fallback = entries.filter(
		(entry) =>
			newsSlug(entry) !== currentSlug &&
			!related.some((item) => newsSlug(item) === newsSlug(entry)),
	);
	return [...related, ...fallback].slice(0, limit);
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

/** Resolve hero media from heroImage* or image* frontmatter. */
export function newsHeroMedia(entry: NewsEntry): {
	src: string | undefined;
	alt: string;
	credit: string | undefined;
	creditHref: string | undefined;
} {
	const data = entry.data;
	const src = data.heroImage ?? data.image;
	const alt = data.heroAlt ?? data.imageAlt ?? data.title;
	const credit =
		data.heroCredit ??
		(data.imageCredit || data.imageLicense
			? [
					data.imageCredit ? `Photo: ${data.imageCredit}` : null,
					data.imageLicense ? `(${data.imageLicense})` : null,
				]
					.filter(Boolean)
					.join(' ')
			: undefined);
	const creditHref = data.imageSource;
	return { src, alt, credit, creditHref };
}
