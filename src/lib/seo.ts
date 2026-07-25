export const SITE_URL = 'https://thepickleballcourt.ca';
export const SITE_NAME = 'ThePickleballCourt.ca';
export const DEFAULT_OG_IMAGE =
	'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80&auto=format&fit=crop';

export function absoluteUrl(path = '/'): string {
	return new URL(path, SITE_URL).href;
}

export function clampMetaDescription(description: string, max = 155): string {
	if (description.length <= max) return description;
	return `${description.slice(0, max - 1).trimEnd()}…`;
}

/** Prefer a unique title ≤60 chars; append brand only when it fits. */
export function formatPageTitle(title: string, max = 60): string {
	const trimmed = title.trim();
	if (trimmed.length >= max) return trimmed.slice(0, max);
	const suffix = ` | ${SITE_NAME}`;
	if (trimmed.includes(SITE_NAME)) return trimmed;
	if (trimmed.length + suffix.length <= max) return `${trimmed}${suffix}`;
	return trimmed;
}

export function organizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: SITE_URL,
		logo: absoluteUrl('/favicon.svg'),
		description:
			'Canadian pickleball gear guides covering paddles, court shoes, and portable nets for players at every level.',
		areaServed: 'CA',
		sameAs: [] as string[],
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
			priceCurrency: 'CAD',
			// Intentionally omit price — Amazon forbids presenting non-API prices as live.
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
