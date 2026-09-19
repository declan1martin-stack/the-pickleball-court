import { SITE_REGION, type SiteRegion } from './site';

/** Canada production GA4 property. Never emit this ID on the US host. */
export const CA_GA_MEASUREMENT_ID = 'G-JWSBZJ6R4P';

/**
 * TODO: Declan/Masterplan — paste the new US GA4 Measurement ID (G-XXXXXXXXXX)
 * once the US property is created. Until then the US build omits gtag rather
 * than sending uspickleballcourt.com traffic to the Canadian property.
 *
 * Preferred: set `PUBLIC_GA_MEASUREMENT_ID` (or `PUBLIC_GA_ID`) on the US
 * Cloudflare Pages project. `PUBLIC_GA_MEASUREMENT_ID_US` also works.
 */
export const US_GA_MEASUREMENT_ID_TODO = '';

function envValue(key: string): string {
	const value = (import.meta.env as Record<string, string | undefined>)[key];
	return typeof value === 'string' ? value.trim() : '';
}

function firstEnv(...keys: string[]): string {
	for (const key of keys) {
		const value = envValue(key);
		if (value) return value;
	}
	return '';
}

function looksLikeGaMeasurementId(id: string): boolean {
	return /^G-[A-Z0-9]+$/i.test(id);
}

/**
 * Region-aware GA4 Measurement ID.
 * CA defaults to G-JWSBZJ6R4P. US uses env / TODO and never falls back to CA.
 */
export function resolveGaMeasurementId(region: SiteRegion = SITE_REGION): string {
	const regionSpecific =
		region === 'us'
			? firstEnv('PUBLIC_GA_MEASUREMENT_ID_US', 'PUBLIC_GA_ID_US')
			: firstEnv('PUBLIC_GA_MEASUREMENT_ID_CA', 'PUBLIC_GA_ID_CA');
	const shared = firstEnv('PUBLIC_GA_MEASUREMENT_ID', 'PUBLIC_GA_ID');
	const candidate = regionSpecific || shared;

	if (region === 'ca') {
		return looksLikeGaMeasurementId(candidate) ? candidate : CA_GA_MEASUREMENT_ID;
	}

	const usId = looksLikeGaMeasurementId(candidate) ? candidate : US_GA_MEASUREMENT_ID_TODO;
	if (!usId || usId === CA_GA_MEASUREMENT_ID) return '';
	return usId;
}
