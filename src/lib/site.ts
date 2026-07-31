export type SiteRegion = 'ca' | 'us';

type SiteConfig = {
	region: SiteRegion;
	siteUrl: string;
	siteName: string;
	affiliateTag: string;
	amazonHost: string;
	amazonLabel: string;
	currency: 'CAD' | 'USD';
	ogLocale: string;
	inLanguage: string;
	areaServed: string;
	email: string;
	marketLabel: string;
};

const SITES: Record<SiteRegion, SiteConfig> = {
	ca: {
		region: 'ca',
		siteUrl: 'https://thepickleballcourt.ca',
		siteName: 'ThePickleballCourt.ca',
		affiliateTag: 'thepickleb050-20',
		amazonHost: 'www.amazon.ca',
		amazonLabel: 'the Canada store',
		currency: 'CAD',
		ogLocale: 'en_CA',
		inLanguage: 'en-CA',
		areaServed: 'CA',
		email: 'hello@thepickleballcourt.ca',
		marketLabel: 'Canadian',
	},
	us: {
		region: 'us',
		siteUrl: 'https://uspickleballcourt.com',
		siteName: 'USPickleballCourt.com',
		affiliateTag: 'uspickleball-20',
		amazonHost: 'www.amazon.com',
		amazonLabel: 'the US store',
		currency: 'USD',
		ogLocale: 'en_US',
		inLanguage: 'en-US',
		areaServed: 'US',
		email: 'hello@uspickleballcourt.com',
		marketLabel: 'US',
	},
};

function resolveRegion(): SiteRegion {
	const raw = (import.meta.env.PUBLIC_SITE_REGION ?? 'ca').toString().trim().toLowerCase();
	return raw === 'us' ? 'us' : 'ca';
}

export const SITE_REGION = resolveRegion();
export const site = SITES[SITE_REGION];

export const SITE_URL = site.siteUrl;
export const SITE_NAME = site.siteName;
export const AFFILIATE_TAG = site.affiliateTag;
export const AMAZON_HOST = site.amazonHost;
export const AMAZON_LABEL = site.amazonLabel;
export const PRICE_CURRENCY = site.currency;
export const OG_LOCALE = site.ogLocale;
export const SITE_EMAIL = site.email;
export const MARKET_LABEL = site.marketLabel;
