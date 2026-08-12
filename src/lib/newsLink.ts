import { getCollection } from 'astro:content';
import { AFFILIATE_TAG, ALTERNATE_SITE_URL, SITE_REGION, SITE_URL, type SiteRegion } from './site';
import { newsSlug, type NewsEntry } from './news';

/** Deterministic per-build site identity (dual Pages projects share this repo). */
export const SITE = {
	market: SITE_REGION,
	host: SITE_URL.replace(/\/$/, ''),
	peerHost: ALTERNATE_SITE_URL.replace(/\/$/, ''),
	amazonTag: AFFILIATE_TAG,
} as const;

export type NewsLinkResult = {
	/** Path or absolute URL — never trailing slash (trailingSlash: 'never'). */
	href: string;
	/** True when the href points at the peer market host. */
	external: boolean;
	peerMarket?: SiteRegion;
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

function marketsFor(entry: NewsEntry): SiteRegion[] {
	return (entry.data.markets ?? (['ca', 'us'] as SiteRegion[])) as SiteRegion[];
}

function availableOn(entry: NewsEntry, region: SiteRegion): boolean {
	return marketsFor(entry).includes(region);
}

function otherMarket(region: SiteRegion): SiteRegion {
	return region === 'us' ? 'ca' : 'us';
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
 * Resolve a news reference to a same-market path when possible, else a peer-host
 * absolute URL, else `/news`.
 */
export async function resolveNewsLink(input: string): Promise<NewsLinkResult> {
	const fullSlug = normalizeNewsSlugInput(input);
	if (!fullSlug || fullSlug === 'feed.xml') {
		return { href: '/news', external: false };
	}

	const { bySlug } = await loadNewsIndex();
	const local = SITE_REGION;
	const peer = otherMarket(local);
	const { market: requestedMarket, bare } = parseMarketPrefix(fullSlug);

	const tryLocal = (slug: string): NewsLinkResult | null => {
		const entry = bySlug.get(slug);
		if (!entry || !availableOn(entry, local)) return null;
		return { href: `/news/${slug}`, external: false };
	};

	const tryPeer = (slug: string): NewsLinkResult | null => {
		const entry = bySlug.get(slug);
		if (!entry || !availableOn(entry, peer)) return null;
		return {
			href: `${SITE.peerHost}/news/${slug}`,
			external: true,
			peerMarket: peer,
		};
	};

	// 1) Exact slug on this host (shared posts + already-correct market prefix).
	const exactLocal = tryLocal(fullSlug);
	if (exactLocal) return exactLocal;

	// 2) Prefer current-market prefixed slug from bare stem.
	const localPrefixed = tryLocal(`${local}-${bare}`);
	if (localPrefixed) return localPrefixed;

	// 3) Peer-market prefixed slug (absolute).
	const peerPrefixed = tryPeer(`${peer}-${bare}`);
	if (peerPrefixed) return peerPrefixed;

	// 4) Requested-market slug on peer if author hard-coded the other prefix.
	if (requestedMarket && requestedMarket !== local) {
		const requested = tryPeer(`${requestedMarket}-${bare}`);
		if (requested) return requested;
	}

	// 5) Exact slug only on peer (market-only post referenced by full slug).
	const exactPeer = tryPeer(fullSlug);
	if (exactPeer) return exactPeer;

	return { href: '/news', external: false };
}

/** Sync helper for tests — clears the getCollection cache between builds. */
export function resetNewsLinkCache(): void {
	cachedIndex = null;
}
