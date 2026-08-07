import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import gear from '../data/gear.json';
import { DEFAULT_AUTHOR_ID, getAuthor } from '../data/authors';

/** Valid product IDs from gear.json — articles reference products by ID only. */
const productIds = new Set(gear.map((product) => product.id));

const faqSchema = z.object({
	question: z.string(),
	answer: z.string(),
});

const authorIdSchema = z.string().superRefine((id, ctx) => {
	if (!getAuthor(id)) {
		ctx.addIssue({
			code: 'custom',
			message: `Unknown author id "${id}". Add them to src/data/authors.json.`,
		});
	}
});

/**
 * Articles content collection.
 * Product data lives only in gear.json — relatedProducts stores IDs, never duplicated fields.
 * `author` is an id from src/data/authors.json.
 */
export const articles = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		slug: z.string(),
		category: z.enum([
			'paddles',
			'shoes',
			'nets',
			'balls',
			'bags',
			'apparel',
			'accessories',
			'guides',
			'rules',
		]),
		type: z.enum(['buying-guide', 'comparison', 'review', 'how-to', 'informational']),
		author: authorIdSchema.default(DEFAULT_AUTHOR_ID),
		publishDate: z.coerce.date(),
		updatedDate: z.coerce.date(),
		heroImage: z.string(),
		heroAlt: z.string(),
		featured: z.boolean().default(false),
		relatedProducts: z.array(z.string()).superRefine((ids, ctx) => {
			for (const id of ids) {
				if (!productIds.has(id)) {
					ctx.addIssue({
						code: 'custom',
						message: `Unknown relatedProducts ID "${id}". Must match an id in src/data/gear.json.`,
					});
				}
			}
		}),
		tags: z.array(z.string()),
		faq: z.array(faqSchema),
	}),
});

/** Short industry updates — frequent, lightweight content velocity signal. */
export const news = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		summary: z.string().min(40),
		tags: z.array(z.string()).default([]),
		/** Single-item update vs multi-story weekly roundup. */
		type: z.enum(['update', 'roundup']).default('update'),
		/**
		 * Which host should list this entry (homepage widget, /news index, RSS).
		 * Direct URLs still build for every entry. Default: both markets.
		 */
		markets: z.array(z.enum(['ca', 'us'])).default(['ca', 'us']),
		/** Same field names as articles — Unsplash/Pexels/Pixabay hotlinks today. */
		heroImage: z.string().optional(),
		heroAlt: z.string().optional(),
		/** Optional attribution line (good practice; not legally required for Unsplash). */
		heroCredit: z.string().optional(),
		sourceUrl: z.string().url().optional(),
		author: authorIdSchema.default(DEFAULT_AUTHOR_ID),
	}),
});

export const collections = { articles, news };
