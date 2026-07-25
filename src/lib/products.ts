import gear from '../data/gear.json';

export type Product = (typeof gear)[number];
export type ProductCategory = Product['category'];

export const AFFILIATE_TAG = 'thepickleb050-20';
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

/** Ensure Amazon.ca URLs always include our Associates tag. */
export function withAffiliateTag(url: string): string {
	try {
		const parsed = new URL(url);
		if (!parsed.hostname.includes('amazon.')) return url;
		parsed.searchParams.set('tag', AFFILIATE_TAG);
		return parsed.toString();
	} catch {
		const separator = url.includes('?') ? '&' : '?';
		if (url.includes('tag=')) {
			return url.replace(/([?&])tag=[^&]*/, `$1tag=${AFFILIATE_TAG}`);
		}
		return `${url}${separator}tag=${AFFILIATE_TAG}`;
	}
}

export function assertAffiliateUrl(url: string): string {
	const tagged = withAffiliateTag(url);
	if (!tagged.includes(`tag=${AFFILIATE_TAG}`)) {
		throw new Error(`Affiliate URL missing required tag: ${url}`);
	}
	return tagged;
}
