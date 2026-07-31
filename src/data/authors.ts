import { MARKET_LABEL, SITE_NAME, SITE_URL } from '../lib/site';

export const authors = {
	editorial: {
		'@type': 'Person' as const,
		name: `${SITE_NAME} Editorial Team`,
		jobTitle: 'Pickleball gear researchers',
		description: `${MARKET_LABEL} pickleball gear researchers focused on paddles, court shoes, and portable nets for players at every level.`,
		url: `${SITE_URL}/about`,
	},
};

export type AuthorKey = keyof typeof authors;
