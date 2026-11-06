import { getCollection } from 'astro:content';
import { SITE_REGION, SITE_URL, type SiteRegion } from './site';
import { newsSlug, type NewsEntry } from './news';

/** Deterministic per-build site identity. One indexable host. */
export const SITE = {
	market: SITE_REGION,
	host: SITE_URL.replace(/\/$/, ''),
	amazonTag: 'uspickleball-20',
} as const;

export type NewsLinkResult = {
	/** Path — never a trailing slash (trailingSlash: 'never'). */
	href: string;
	/** Always false. The Canada host is retired, so links stay on this site. */
	external: boolean;
};

type NewsIndex = {
	bySlug: Map<string, NewsEntry>;
};

let cachedIndex: NewsIndex | null = null;

async function loadNewsIndex(): Promise<NewsIndex> {
	if (cachedIndex) return cachedIndex;
	const entries = await getCollection('news');
	const bySlug = new Map<string, NewsEntry>();
	for (const entry of entries) {
		bySlug.set(newsSlug(entry), entry);
	}
	cachedIndex = { bySlug };
	return cachedIndex;
}

/** Strip `/news/` prefix, `.md(x)`, and trailing slashes. */
export function normalizeNewsSlugInput(input: string): string {
	let raw = input.trim();
	raw = raw.replace(/^https?:\/\/[^/]+/i, '');
	raw = raw.replace(/^\/+/, '').replace(/\/+$/, '');
	if (raw.startsWith('news/')) raw = raw.slice('news/'.length);
	raw = raw.replace(/\.(md|mdx)$/i, '');
	return raw.replace(/\/+$/, '');
}

function parseMarketPrefix(slug: string): { market: SiteRegion | null; bare: string } {
	if (slug.startsWith('us-')) return { market: 'us', bare: slug.slice(3) };
	if (slug.startsWith('ca-')) return { market: 'ca', bare: slug.slice(3) };
	return { market: null, bare: slug };
}

/**
 * Resolve a news reference to a path on this host.
 * Canada-only posts are published here too (the other host is retired).
 * Unknown slugs fall back to the news index so the link cannot 404.
 */
export async function resolveNewsLink(input: string): Promise<NewsLinkResult> {
	const fullSlug = normalizeNewsSlugInput(input);
	if (!fullSlug || fullSlug === 'feed.xml') {
		return { href: '/news', external: false };
	}

	const { bySlug } = await loadNewsIndex();
	const { bare } = parseMarketPrefix(fullSlug);
	const candidates = [fullSlug, `us-${bare}`, bare, `ca-${bare}`];
	const seen = new Set<string>();
	for (const slug of candidates) {
		if (seen.has(slug)) continue;
		seen.add(slug);
		if (bySlug.has(slug)) return { href: `/news/${slug}`, external: false };
	}

	return { href: '/news', external: false };
}

/** Sync helper for tests — clears the getCollection cache between builds. */
export function resetNewsLinkCache(): void {
	cachedIndex = null;
}
