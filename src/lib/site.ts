export type SiteRegion = 'ca' | 'us';

type SiteConfig = {
	region: SiteRegion;
	siteUrl: string;
	siteName: string;
	affiliateTag: string;
	amazonHost: string;
	/** Phrase used in prose: "the US store" */
	amazonLabel: string;
	/** Button/SERP label */
	amazonStore: string;
	currency: 'USD';
	ogLocale: string;
	inLanguage: string;
	hreflang: string;
	areaServed: string;
	email: string;
	/** Adjective: "US" */
	marketLabel: string;
	/** Noun phrase: "the US" */
	marketCountry: string;
	/** People label */
	marketPlayers: string;
};

/**
 * One indexable host. `PUBLIC_SITE_REGION=ca` (legacy `build:ca`) still
 * resolves here so that check cannot fail or publish a second canonical.
 */
const US_SITE: SiteConfig = {
	region: 'us',
	siteUrl: 'https://uspickleballcourt.com',
	siteName: 'USPickleballCourt.com',
	affiliateTag: 'uspickleball-20',
	amazonHost: 'www.amazon.com',
	amazonLabel: 'the US store',
	amazonStore: 'Amazon.com',
	currency: 'USD',
	ogLocale: 'en_US',
	inLanguage: 'en-US',
	hreflang: 'en-US',
	areaServed: 'US',
	email: 'hello@uspickleballcourt.com',
	marketLabel: 'US',
	marketCountry: 'the US',
	marketPlayers: 'US players',
};

function resolveRegion(): SiteRegion {
	return 'us';
}

export const SITE_REGION = resolveRegion();
export const site = US_SITE;

export const SITE_URL = site.siteUrl;
export const SITE_NAME = site.siteName;
export const AFFILIATE_TAG = site.affiliateTag;
export const AMAZON_HOST = site.amazonHost;
export const AMAZON_LABEL = site.amazonLabel;
export const AMAZON_STORE = site.amazonStore;
export const PRICE_CURRENCY = site.currency;
export const OG_LOCALE = site.ogLocale;
export const SITE_EMAIL = site.email;
export const MARKET_LABEL = site.marketLabel;
export const MARKET_COUNTRY = site.marketCountry;
export const MARKET_PLAYERS = site.marketPlayers;
export const HREFLANG = site.hreflang;

/** Display catalog price using this site's currency code. */
export function formatCatalogPrice(price: string): string {
	return price.replace(/\bCAD\b/g, PRICE_CURRENCY).replace(/\bUSD\b/g, PRICE_CURRENCY);
}
