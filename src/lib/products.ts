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

/** Normalize Amazon links to this build's marketplace host + Associates tag. */
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

/** Approximate catalog price tier — never presented as a live Amazon price. */
export function getPriceTier(price: string): '$' | '$$' | '$$$' {
	const trimmed = price.trim();
	if (trimmed === '$' || trimmed === '$$' || trimmed === '$$$') return trimmed;
	const amount = Number(price.replace(/[^0-9.]/g, ''));
	if (!Number.isFinite(amount) || amount < 150) return '$';
	if (amount < 220) return '$$';
	return '$$$';
}

/** True when `price` is already a tier token, not a dollar amount. */
export function isPriceTier(price: string): boolean {
	const trimmed = price.trim();
	return trimmed === '$' || trimmed === '$$' || trimmed === '$$$';
}

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
