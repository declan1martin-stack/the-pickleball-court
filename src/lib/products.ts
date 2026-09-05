import gear from '../data/gear.json';
import { AFFILIATE_TAG, AMAZON_HOST, SITE_REGION, type SiteRegion } from './site';

export type Product = (typeof gear)[number];
export type ProductCategory = Product['category'];

export { AFFILIATE_TAG };
export const products: Product[] = gear;

const byId = new Map(products.map((product) => [product.id, product]));

export function getProductById(id: string): Product | undefined {
	return byId.get(id);
}

export function getProductsByIds(ids: string[]): Product[] {
	return ids
		.map((id) => getProductById(id))
		.filter((product): product is Product => Boolean(product));
}

export function getProductsByCategory(category: ProductCategory): Product[] {
	return products.filter((product) => product.category === category);
}

function amazonMarketplace(url: string): SiteRegion | null {
	if (/amazon\.ca/i.test(url)) return 'ca';
	if (/amazon\.com/i.test(url)) return 'us';
	return null;
}

/**
 * Keep the URL on this build's Amazon marketplace and Associates tag.
 * Never rewrite a .ca ASIN onto amazon.com (or the reverse) — ASINs are
 * marketplace-specific. Search URLs may be retargeted; product pages may not.
 */
export function withAffiliateTag(url: string): string {
	try {
		const parsed = new URL(url);
		if (!parsed.hostname.includes('amazon.')) return url;
		const market = amazonMarketplace(url);
		if (market && market !== SITE_REGION) {
			throw new Error(
				`Cross-marketplace Amazon URL on ${SITE_REGION} build: ${url}. Use affiliateUrls.${SITE_REGION}.`,
			);
		}
		parsed.hostname = AMAZON_HOST;
		parsed.protocol = 'https:';
		parsed.searchParams.set('tag', AFFILIATE_TAG);
		return parsed.toString();
	} catch (error) {
		if (error instanceof Error && error.message.startsWith('Cross-marketplace')) {
			throw error;
		}
		throw new Error(`Invalid Amazon URL: ${url}`);
	}
}

export function assertAffiliateUrl(url: string): string {
	const tagged = withAffiliateTag(url);
	if (!tagged.includes(`tag=${AFFILIATE_TAG}`)) {
		throw new Error(`Affiliate URL missing required tag: ${url}`);
	}
	if (!tagged.includes(AMAZON_HOST.replace('www.', ''))) {
		throw new Error(`Affiliate URL not on ${AMAZON_HOST}: ${tagged}`);
	}
	return tagged;
}

/** Buy-button copy. Never includes a live price. */
export function getShopCtaLabel(product: Product, store: string): string {
	switch (product.category) {
		case 'paddles':
			return `Shop now — this paddle on ${store}`;
		case 'shoes':
			return `Shop now — these shoes on ${store}`;
		case 'nets':
			return `Shop now — this net on ${store}`;
		case 'balls':
			return `Shop now — these balls on ${store}`;
		case 'bags':
			return `Shop now — this bag on ${store}`;
		case 'accessories':
			return `Shop now — this accessory on ${store}`;
		case 'apparel':
			return `Shop now — this on ${store}`;
		default:
			return `Shop now on ${store}`;
	}
}

/** Amazon Associates URL for this product on the current host's marketplace. */
export function getAffiliateUrl(product: Product): string {
	const url = product.affiliateUrls?.[SITE_REGION];
	if (!url) {
		throw new Error(`Product ${product.id} is missing affiliateUrls.${SITE_REGION}`);
	}
	return assertAffiliateUrl(url);
}

export type PriceTier = '$' | '$$' | '$$$' | '$$$$' | '$$$$$';

/**
 * Map catalog `price` to a relative tier token ($–$$$$$).
 * Prefer storing tiers directly in gear.json. Numeric leftovers are mapped once
 * for safety and must not be displayed as live prices.
 */
export function getPriceTier(price: string): PriceTier {
	const trimmed = price.trim();
	if (/^\$+$/.test(trimmed) && trimmed.length >= 1 && trimmed.length <= 5) {
		return trimmed as PriceTier;
	}
	const amount = Number(price.replace(/[^0-9.]/g, ''));
	if (!Number.isFinite(amount) || amount <= 0) return '$';
	if (amount <= 50) return '$';
	if (amount <= 75) return '$$';
	if (amount <= 100) return '$$$';
	if (amount <= 150) return '$$$$';
	return '$$$$$';
}

/** True when `price` is already a tier token, not a dollar amount. */
export function isPriceTier(price: string): boolean {
	const trimmed = price.trim();
	return /^\$+$/.test(trimmed) && trimmed.length >= 1 && trimmed.length <= 5;
}

export const PRICE_TIER_RANK: Record<PriceTier, number> = {
	$: 1,
	$$: 2,
	$$$: 3,
	$$$$: 4,
	$$$$$: 5,
};

export type ProductGender = 'mens' | 'womens' | 'unisex';
export type ComfortTag =
	| 'wide-fit'
	| 'arch-support'
	| 'plantar-fasciitis-relief'
	| 'extra-cushioning'
	| 'low-impact';

/** Missing gender is treated as unisex so products stay visible under that filter. */
export function getEffectiveGender(product: Product): ProductGender {
	const gender = (product as { gender?: ProductGender }).gender;
	if (gender === 'mens' || gender === 'womens' || gender === 'unisex') return gender;
	return 'unisex';
}

export function getComfortTags(product: Product): ComfortTag[] {
	const tags = (product as { comfortTags?: ComfortTag[] }).comfortTags;
	return Array.isArray(tags) ? tags : [];
}
