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

/** Newest market-visible post tagged gear (or a gear-roundup slug). */
export async function getLatestGearPost(): Promise<NewsEntry | undefined> {
	const entries = await getNewsForMarket();
	return entries.find((entry) => {
		const tags = entry.data.tags.map((tag) => tag.toLowerCase());
		return tags.includes('gear') || newsSlug(entry).includes('gear-roundup');
	});
}

export function newsSlug(entry: NewsEntry): string {
	return entry.id.replace(/\.(md|mdx)$/i, '');
}

export function newsTypeLabel(type: NewsEntry['data']['type']): string {
	if (type === 'roundup') return 'Roundup';
	if (type === 'feature') return 'Feature';
	return 'Update';
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

export type NewsCategory = 'United States' | 'Canada' | 'Rising Stars' | 'Gear' | 'Global';

/** Tag → newsroom section label. Order matters (gear/global before Canada). */
export function newsCategory(tags: string[] = []): NewsCategory {
	const t = tags.map((tag) => tag.toLowerCase());
	if (t.some((tag) => tag.includes('rising star'))) return 'Rising Stars';
	if (t.includes('gear') || t.includes('paddles') || t.includes('brands')) return 'Gear';
	if (t.some((tag) => tag.includes('ranking') || tag.includes('world pickleball'))) return 'Global';
	if (
		t.some(
			(tag) =>
				tag.includes('canada') ||
				tag.includes('cnpl') ||
				tag.includes('toronto') ||
				tag.includes('montreal') ||
				tag.includes('vancouver'),
		)
	) {
		return 'Canada';
	}
	return 'United States';
}

/** Distinct Commons fallbacks so categories never share a default photo. */
export const NEWS_CATEGORY_IMAGE: Record<
	NewsCategory,
	{ src: string; credit: string; license: string; alt: string }
> = {
	'United States': {
		src: '/images/news/pickleball-pros.jpg',
		credit: 'Picklerpeej',
		license: 'CC BY-SA 4.0',
		alt: 'Two players in a rally on an outdoor pickleball court',
	},
	Canada: {
		src: '/images/news/pickleball-player.jpg',
		credit: 'Picklerpeej',
		license: 'CC BY-SA 4.0',
		alt: 'A pickleball player preparing to hit on an outdoor court',
	},
	'Rising Stars': {
		src: '/images/news/willy-chung.jpg',
		credit: 'EasonChou0621',
		license: 'CC0',
		alt: 'Taiwanese pickleball player Willy Chung in competition',
	},
	Gear: {
		src: '/images/news/gear-roundup-diadem-luzz-august-21-2026.jpg',
		credit: 'TheVillagesFL',
		license: 'CC BY-SA 4.0',
		alt: 'Four recreational players in a doubles rally on an outdoor pickleball court',
	},
	Global: {
		src: '/images/news/johns-brothers.jpg',
		credit: 'Mark.E.Johns',
		license: 'CC BY-SA 4.0',
		alt: 'Ben Johns and Collin Johns on a pickleball court',
	},
};

const CANADA_EVENTS_IMAGE = {
	src: '/images/news/pickleball-player.jpg',
	credit: 'Picklerpeej',
	license: 'CC BY-SA 4.0',
	alt: 'A pickleball player preparing a backhand on an outdoor hard court',
};

export type NewsCardMedia = {
	src: string;
	alt: string;
	credit: string | undefined;
	license: string | undefined;
};

/** Unique frontmatter `image` wins; otherwise a per-category default. */
export function newsCardMedia(entry: NewsEntry, usedSrcs?: Set<string>): NewsCardMedia {
	const category = newsCategory(entry.data.tags);
	const hero = newsHeroMedia(entry);
	const events = entry.data.tags.some((tag) => {
		const t = tag.toLowerCase();
		return t.includes('cnpl') || t.includes('nationals');
	});
	const fallback =
		category === 'Canada' && events ? CANADA_EVENTS_IMAGE : NEWS_CATEGORY_IMAGE[category];

	let src = hero.src || fallback.src;
	let alt = hero.src ? hero.alt : fallback.alt;
	let credit = hero.src
		? (entry.data.imageCredit ?? entry.data.heroCredit)
		: fallback.credit;
	let license = hero.src ? entry.data.imageLicense : fallback.license;

	if (usedSrcs?.has(src)) {
		const unused = [
			NEWS_CATEGORY_IMAGE['United States'],
			NEWS_CATEGORY_IMAGE.Canada,
			NEWS_CATEGORY_IMAGE['Rising Stars'],
			NEWS_CATEGORY_IMAGE.Gear,
			NEWS_CATEGORY_IMAGE.Global,
			CANADA_EVENTS_IMAGE,
		].find((item) => !usedSrcs.has(item.src));
		if (unused) {
			src = unused.src;
			alt = unused.alt;
			credit = unused.credit;
			license = unused.license;
		}
	}
	usedSrcs?.add(src);

	return { src, alt, credit, license };
}
