export const authors = {
	editorial: {
		'@type': 'Person' as const,
		name: 'ThePickleballCourt.ca Editorial Team',
		jobTitle: 'Pickleball gear researchers',
		description:
			'Canadian pickleball gear researchers focused on paddles, court shoes, and portable nets for players at every level.',
		url: 'https://thepickleballcourt.ca/about',
	},
};

export type AuthorKey = keyof typeof authors;
