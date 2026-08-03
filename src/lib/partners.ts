import type { Product } from './products';
import { SITE_NAME, SITE_REGION } from './site';

export type PartnerId = 'selkirk' | 'pickleball-superstore';

export type PartnerOffer = {
	id: PartnerId;
	label: string;
	shortLabel: string;
	href: string;
	/** True when a real affiliate/tracking ID is configured. */
	tracked: boolean;
};

function env(name: string): string {
	const value = (import.meta.env[name] as string | undefined)?.trim();
	return value || '';
}

/** AvantLink publisher website id (pw / website_id). */
const AVANTLINK_WEBSITE_ID =
	env('PUBLIC_AVANTLINK_WEBSITE_ID') || env('PUBLIC_AVANTLINK_PW');
/** Selkirk merchant id on AvantLink (mi / merchant_id). */
const AVANTLINK_SELKIRK_MERCHANT_ID =
	env('PUBLIC_AVANTLINK_SELKIRK_MERCHANT_ID') || env('PUBLIC_AVANTLINK_SELKIRK_MI');
/** Pickleball Superstore SuperAffiliate code, e.g. Jane-12345678 */
const PBS_AFFILIATE_CODE = env('PUBLIC_PICKLEBALL_SUPERSTORE_CODE');

export const PARTNER_LABELS = {
	selkirk: 'Selkirk',
	pickleballSuperstore: 'Pickleball Superstore',
} as const;

function utm(url: string, partner: PartnerId): string {
	const next = new URL(url);
	next.searchParams.set('utm_source', SITE_REGION === 'us' ? 'uspickleballcourt' : 'thepickleballcourt');
	next.searchParams.set('utm_medium', 'affiliate');
	next.searchParams.set('utm_campaign', partner);
	next.searchParams.set('utm_content', SITE_NAME);
	return next.toString();
}

/** Wrap a destination URL in an AvantLink custom click tracker when IDs are configured. */
export function withAvantLink(destinationUrl: string, merchantId = AVANTLINK_SELKIRK_MERCHANT_ID): {
	href: string;
	tracked: boolean;
} {
	if (!AVANTLINK_WEBSITE_ID || !merchantId) {
		return { href: destinationUrl, tracked: false };
	}
	const params = new URLSearchParams({
		tt: 'cl',
		mi: merchantId,
		pw: AVANTLINK_WEBSITE_ID,
		url: destinationUrl,
		ctc: SITE_REGION,
	});
	return {
		href: `https://www.avantlink.com/click.php?${params.toString()}`,
		tracked: true,
	};
}

function selkirkSearchUrl(product: Product): string {
	const query = [product.brand, product.name].filter(Boolean).join(' ').trim();
	return utm(`https://www.selkirk.com/search?q=${encodeURIComponent(query)}`, 'selkirk');
}

function pickleballSuperstoreSearchUrl(product: Product): string {
	const query = [product.brand, product.name].filter(Boolean).join(' ').trim();
	const searchPath = `/search?q=${encodeURIComponent(query)}`;
	if (PBS_AFFILIATE_CODE) {
		// Shopify-style discount/ref landing used by PBS SuperAffiliate codes.
		return utm(
			`https://pickleballsuperstore.com/discount/${encodeURIComponent(PBS_AFFILIATE_CODE)}?redirect=${encodeURIComponent(searchPath)}`,
			'pickleball-superstore',
		);
	}
	return utm(`https://pickleballsuperstore.com${searchPath}`, 'pickleball-superstore');
}

export function getSelkirkOffer(product: Product): PartnerOffer | null {
	if (!/selkirk/i.test(product.brand || '')) return null;
	const destination = selkirkSearchUrl(product);
	const wrapped = withAvantLink(destination);
	return {
		id: 'selkirk',
		label: 'Shop at Selkirk',
		shortLabel: PARTNER_LABELS.selkirk,
		href: wrapped.href,
		tracked: wrapped.tracked,
	};
}

export function getPickleballSuperstoreOffer(product: Product): PartnerOffer | null {
	// Specialty multi-brand retailer — useful across gear categories.
	const destination = pickleballSuperstoreSearchUrl(product);
	return {
		id: 'pickleball-superstore',
		label: 'Shop Pickleball Superstore',
		shortLabel: PARTNER_LABELS.pickleballSuperstore,
		href: destination,
		tracked: Boolean(PBS_AFFILIATE_CODE),
	};
}

/** Secondary specialty-retailer offers for a catalog product (Amazon stays primary). */
export function getPartnerOffers(product: Product): PartnerOffer[] {
	return [getSelkirkOffer(product), getPickleballSuperstoreOffer(product)].filter(
		(offer): offer is PartnerOffer => Boolean(offer),
	);
}

export function partnersConfigured(): {
	selkirkTracked: boolean;
	pickleballSuperstoreTracked: boolean;
} {
	return {
		selkirkTracked: Boolean(AVANTLINK_WEBSITE_ID && AVANTLINK_SELKIRK_MERCHANT_ID),
		pickleballSuperstoreTracked: Boolean(PBS_AFFILIATE_CODE),
	};
}
