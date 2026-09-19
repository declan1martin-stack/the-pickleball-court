import { SITE_REGION, type SiteRegion } from './site';

/** Canada production GA4 property (thepickleballcourt.ca). Never emit on the US host. */
export const CA_GA_MEASUREMENT_ID = 'G-JWSBZJ6R4P';

/** US production GA4 property (uspickleballcourt.com). Confirmed by Cillian. */
export const US_GA_MEASUREMENT_ID = 'G-WE9TTJLH00';

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

function usableGaId(id: string, forbidden: string): string {
	if (!looksLikeGaMeasurementId(id) || id === forbidden) return '';
	return id;
}

/**
 * Region-aware GA4 Measurement ID.
 * CA defaults to G-JWSBZJ6R4P. US defaults to G-WE9TTJLH00.
 * A leftover env value for the other region is ignored.
 */
export function resolveGaMeasurementId(region: SiteRegion = SITE_REGION): string {
	const regionSpecific =
		region === 'us'
			? firstEnv('PUBLIC_GA_MEASUREMENT_ID_US', 'PUBLIC_GA_ID_US')
			: firstEnv('PUBLIC_GA_MEASUREMENT_ID_CA', 'PUBLIC_GA_ID_CA');
	const shared = firstEnv('PUBLIC_GA_MEASUREMENT_ID', 'PUBLIC_GA_ID');

	if (region === 'ca') {
		return (
			usableGaId(regionSpecific, US_GA_MEASUREMENT_ID) ||
			usableGaId(shared, US_GA_MEASUREMENT_ID) ||
			CA_GA_MEASUREMENT_ID
		);
	}

	return (
		usableGaId(regionSpecific, CA_GA_MEASUREMENT_ID) ||
		usableGaId(shared, CA_GA_MEASUREMENT_ID) ||
		US_GA_MEASUREMENT_ID
	);
}
