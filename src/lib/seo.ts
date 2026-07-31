import {
	PRICE_CURRENCY,
	SITE_EMAIL,
	SITE_NAME,
	SITE_URL,
	site,
} from './site';

export { SITE_NAME, SITE_URL };
export const DEFAULT_OG_IMAGE =
	'https://images.unsplash.com/photo-1762423570127-c36ff11b883f?w=1200&q=80&auto=format&fit=crop';

export function absoluteUrl(path = '/'): string {
	return new URL(path, SITE_URL).href;
}

export function clampMetaDescription(description: string, max = 155): string {
	if (description.length <= max) return description;
	return `${description.slice(0, max - 1).trimEnd()}…`;
}

function softTrimTitle(value: string, max: number): string {
	if (value.length <= max) return value;
	const slice = value.slice(0, Math.max(1, max - 1));
	const lastSpace = slice.lastIndexOf(' ');
	const base = lastSpace > Math.floor(max * 0.6) ? slice.slice(0, lastSpace) : slice;
	return `${base.trimEnd()}…`;
}

/** Prefer a unique title ≤60 chars; append brand only when it fits. Never mid-word slice. */
export function formatPageTitle(title: string, max = 60): string {
	const trimmed = title.trim();
	const suffix = ` | ${SITE_NAME}`;
	if (trimmed.includes(SITE_NAME)) return softTrimTitle(trimmed, max);
	if (trimmed.length + suffix.length <= max) return `${trimmed}${suffix}`;
	if (trimmed.length <= max) return trimmed;
	return softTrimTitle(trimmed, max);
}

/** Absolute URLs for CA / US alternates of the same path. */
export function hreflangAlternates(pathname: string): {
	ca: string;
	us: string;
	xDefault: string;
} {
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	const normalized = path === '/' ? '/' : path.replace(/\/$/, '') || '/';
	return {
		ca: `https://thepickleballcourt.ca${normalized === '/' ? '/' : normalized}`,
		us: `https://uspickleballcourt.com${normalized === '/' ? '/' : normalized}`,
		xDefault: `https://thepickleballcourt.ca${normalized === '/' ? '/' : normalized}`,
	};
}

export function organizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: SITE_URL,
		logo: absoluteUrl('/favicon.svg'),
		description: `${site.marketLabel} pickleball gear guides covering paddles, court shoes, balls, bags, apparel, accessories, and portable nets.`,
		areaServed: site.areaServed,
		email: SITE_EMAIL,
		founder: {
			'@type': 'Person',
			name: `${SITE_NAME} Editorial Team`,
			url: absoluteUrl('/about'),
			jobTitle: 'Pickleball gear researchers',
		},
		// Add real social profile URLs here once accounts exist.
		sameAs: [] as string[],
	};
}

export function websiteSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: SITE_URL,
		description: `${site.marketLabel} pickleball gear guides and ${site.amazonLabel} product catalogs for paddles, shoes, nets, balls, bags, apparel, and accessories.`,
		inLanguage: site.inLanguage,
		publisher: {
			'@type': 'Organization',
			name: SITE_NAME,
			url: SITE_URL,
		},
	};
}

export function itemListSchema(input: {
	name: string;
	description: string;
	path: string;
	items: { name: string; url: string; position: number }[];
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: input.name,
		description: input.description,
		url: absoluteUrl(input.path),
		numberOfItems: input.items.length,
		itemListElement: input.items.map((item) => ({
			'@type': 'ListItem',
			position: item.position,
			name: item.name,
			url: item.url,
		})),
	};
}

export function breadcrumbSchema(items: { name: string; path?: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			...(item.path ? { item: absoluteUrl(item.path) } : {}),
		})),
	};
}

export function articleSchema(input: {
	title: string;
	description: string;
	path: string;
	image: string;
	author: string;
	publishDate: Date | string;
	updatedDate: Date | string;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: input.title,
		description: input.description,
		image: [input.image],
		author: {
			'@type': 'Person',
			name: input.author,
		},
		publisher: {
			'@type': 'Organization',
			name: SITE_NAME,
			logo: {
				'@type': 'ImageObject',
				url: absoluteUrl('/favicon.svg'),
			},
		},
		datePublished: new Date(input.publishDate).toISOString(),
		dateModified: new Date(input.updatedDate).toISOString(),
		mainEntityOfPage: absoluteUrl(input.path),
	};
}

export function productSchema(input: {
	name: string;
	description: string;
	image: string;
	brand: string;
	url: string;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: input.name,
		description: input.description,
		image: input.image,
		brand: {
			'@type': 'Brand',
			name: input.brand,
		},
		offers: {
			'@type': 'Offer',
			url: input.url,
			availability: 'https://schema.org/InStock',
			priceCurrency: PRICE_CURRENCY,
			// Intentionally omit price — do not present non-API catalog prices as live retail prices.
		},
	};
}

export function reviewSchema(input: {
	itemName: string;
	author: string;
	reviewBody: string;
	datePublished: Date | string;
	ratingValue?: number;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Review',
		itemReviewed: {
			'@type': 'Product',
			name: input.itemName,
		},
		author: {
			'@type': 'Person',
			name: input.author,
		},
		reviewBody: input.reviewBody,
		datePublished: new Date(input.datePublished).toISOString(),
		...(typeof input.ratingValue === 'number'
			? {
					reviewRating: {
						'@type': 'Rating',
						ratingValue: input.ratingValue,
						bestRating: 5,
					},
				}
			: {}),
	};
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer,
			},
		})),
	};
}
