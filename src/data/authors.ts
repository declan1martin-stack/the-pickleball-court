import authorsData from './authors.json';

export type Author = {
	id: string;
	name: string;
	role: string;
	bio: string;
	avatar: string;
};

export const DEFAULT_AUTHOR_ID = 'deco';

const authors = authorsData as Author[];

export function getAllAuthors(): Author[] {
	return authors;
}

export function getAuthor(id: string): Author | undefined {
	return authors.find((author) => author.id === id);
}

export function requireAuthor(id: string): Author {
	const author = getAuthor(id);
	if (!author) {
		throw new Error(`Unknown author id "${id}". Add them to src/data/authors.json.`);
	}
	return author;
}

/** Resolve a frontmatter author id (or legacy display name) to an Author record. */
export function resolveAuthor(authorRef: string): Author {
	// Legacy slug — all bylines now publish as Deco.
	if (authorRef === 'declan-martin' || authorRef === 'Declan Martin') {
		return requireAuthor(DEFAULT_AUTHOR_ID);
	}
	const byId = getAuthor(authorRef);
	if (byId) return byId;
	const byName = authors.find((author) => author.name === authorRef);
	if (byName) return byName;
	return requireAuthor(DEFAULT_AUTHOR_ID);
}

export function authorPath(id: string): string {
	return `/authors/${id}`;
}
