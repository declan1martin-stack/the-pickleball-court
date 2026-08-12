import gear from '../data/gear.json';
import { AFFILIATE_TAG, AMAZON_HOST } from './site';

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

/** Normalize marketplace affiliate links to this build's host + Associates tag. */
export function withAffiliateTag(url: string): string {
	try {
		const parsed = new URL(url);
		if (!parsed.hostname.includes('amazon.')) return url;
		parsed.hostname = AMAZON_HOST;
		parsed.protocol = 'https:';
		parsed.searchParams.set('tag', AFFILIATE_TAG);
		return parsed.toString();
	} catch {
		const separator = url.includes('?') ? '&' : '?';
		let next = url
			.replace(/https?:\/\/(www\.)?amazon\.(ca|com)/i, `https://${AMAZON_HOST}`)
			.replace(/([?&])tag=[^&]*/, `$1tag=${AFFILIATE_TAG}`);
		if (!next.includes('tag=')) {
			next = `${next}${separator}tag=${AFFILIATE_TAG}`;
		}
		return next;
	}
}

export function assertAffiliateUrl(url: string): string {
	const tagged = withAffiliateTag(url);
	if (!tagged.includes(`tag=${AFFILIATE_TAG}`)) {
		throw new Error(`Affiliate URL missing required tag: ${url}`);
	}
	return tagged;
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
