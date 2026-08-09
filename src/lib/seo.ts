import {
	authorPath,
	DEFAULT_AUTHOR_ID,
	getAuthor,
	type Author,
} from '../data/authors';
import { SITE_EMAIL, SITE_NAME, SITE_URL, site } from './site';

export { SITE_NAME, SITE_URL };
export const DEFAULT_OG_IMAGE = '/og-default.png';

const ORG_ID = `${SITE_URL.replace(/\/$/, '')}/#organization`;
const WEBSITE_ID = `${SITE_URL.replace(/\/$/, '')}/#website`;

/** Strip trailing slashes except for the site root (`/`). Matches `trailingSlash: 'never'`. */
export function normalizePath(pathname: string): string {
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	if (path === '/') return '/';
	return path.replace(/\/+$/, '') || '/';
}

export function absoluteUrl(path = '/'): string {
	const normalized = normalizePath(path);
	// Match @astrojs/sitemap + trailingSlash:'never' (root loc has no trailing slash).
	if (normalized === '/') return SITE_URL.replace(/\/$/, '');
	return new URL(normalized, SITE_URL).href;
}

export function clampMetaDescription(description: string, max = 155): string {
	if (description.length <= max) return description;
	return `${description.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Prefer a unique title ≤60 chars; append brand only when it fits.
 * Does not mid-sentence truncate — if over max, return the title as authored
 * (search engines will clip in SERPs; authors should keep titles short).
 */
export function formatPageTitle(title: string, max = 60): string {
	const trimmed = title.trim();
	const suffix = ` | ${SITE_NAME}`;
	if (trimmed.includes(SITE_NAME)) return trimmed;
	if (trimmed.length + suffix.length <= max) return `${trimmed}${suffix}`;
	return trimmed;
}

export function organizationSchema() {
	const founder = getAuthor(DEFAULT_AUTHOR_ID);
	const founderUrl = founder ? absoluteUrl(authorPath(founder.id)) : undefined;
	return {
		'@type': 'Organization',
		'@id': ORG_ID,
		name: site.region === 'us' ? 'US Pickleball Court' : 'The Pickleball Court',
		alternateName: SITE_NAME,
		url: SITE_URL.replace(/\/$/, ''),
		logo: {
			'@type': 'ImageObject',
			url: absoluteUrl('/og-default.png'),
			width: 1200,
			height: 630,
		},
		description: `${site.marketLabel} pickleball gear guides covering paddles, court shoes, balls, bags, apparel, accessories, and portable nets.`,
		areaServed: site.areaServed,
		email: SITE_EMAIL,
		publishingPrinciples: absoluteUrl('/editorial-policy'),
		knowsAbout: [
			'pickleball paddles',
			'pickleball shoes',
			'pickleball nets',
			'pickleball balls',
			'pickleball gear',
		],
		founder: founder
			? {
					'@type': 'Person',
					'@id': `${founderUrl}#person`,
					name: founder.name,
					url: founderUrl,
					jobTitle: founder.role,
				}
			: undefined,
	};
}

export function websiteSchema() {
	return {
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		name: SITE_NAME,
		url: SITE_URL.replace(/\/$/, ''),
		description: `${site.marketLabel} pickleball gear guides and ${site.amazonLabel} product catalogs for paddles, shoes, nets, balls, bags, apparel, and accessories.`,
		inLanguage: site.inLanguage,
		publisher: { '@id': ORG_ID },
	};
}

export function personSchema(author: Author) {
	const url = absoluteUrl(authorPath(author.id));
	return {
		'@type': 'Person',
		'@id': `${url}#person`,
		name: author.name,
		alternateName: author.id === 'declan-martin' ? 'Deco' : undefined,
		jobTitle: author.role,
		description: author.bio,
		url,
		image: absoluteUrl(author.avatar),
		worksFor: { '@id': ORG_ID },
	};
}

export function itemListSchema(input: {
	name: string;
	description: string;
	path: string;
	items: { name: string; url: string; position: number }[];
}) {
	return {
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
	authorUrl?: string;
	publishDate: Date | string;
	updatedDate?: Date | string;
	/** Use NewsArticle for news posts. */
	type?: 'Article' | 'NewsArticle';
	inLanguage?: string;
}) {
	const pageUrl = absoluteUrl(input.path);
	const datePublished = new Date(input.publishDate).toISOString();
	const dateModified = input.updatedDate
		? new Date(input.updatedDate).toISOString()
		: datePublished;
	return {
		'@type': input.type ?? 'Article',
		'@id': `${pageUrl}#article`,
		headline: input.title,
		description: input.description,
		url: pageUrl,
		image: [input.image],
		inLanguage: input.inLanguage ?? site.inLanguage,
		isPartOf: { '@id': WEBSITE_ID },
		author: {
			'@type': 'Person',
			name: input.author,
			...(input.authorUrl
				? { '@id': `${input.authorUrl}#person`, url: input.authorUrl }
				: {}),
		},
		publisher: { '@id': ORG_ID },
		datePublished,
		dateModified,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': pageUrl,
		},
	};
}

export function productSchema(input: {
	name: string;
	description: string;
	image: string;
	brand: string;
	url: string;
	review?: {
		author: string;
		reviewBody: string;
		datePublished: Date | string;
		ratingValue?: number;
	};
}) {
	// No Offer block: affiliate catalogs must not invent live prices/availability.
	return {
		'@type': 'Product',
		name: input.name,
		description: input.description,
		image: input.image,
		brand: {
			'@type': 'Brand',
			name: input.brand,
		},
		url: input.url,
		...(input.review
			? {
					review: {
						'@type': 'Review',
						author: {
							'@type': 'Person',
							name: input.review.author,
						},
						reviewBody: input.review.reviewBody,
						datePublished: new Date(input.review.datePublished).toISOString(),
						...(typeof input.review.ratingValue === 'number'
							? {
									reviewRating: {
										'@type': 'Rating',
										ratingValue: input.review.ratingValue,
										bestRating: 5,
									},
								}
							: {}),
					},
				}
			: {}),
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
