/**
 * Some catalog feature lines were stored with a hard character cap (120 or 140),
 * which sliced bullets mid-word. Cards show the stored string up to a higher
 * cap and always stop on a word boundary.
 */
export const FEATURE_DISPLAY_MAX = 240;

const HARD_SLICE_LENGTHS = new Set([120, 140]);

/** Endings that usually mean the token is a whole word, not a clipped stem. */
const FINISHED_WORD =
	/(?:s|ed|er|ers|ing|ly|ion|ness|ment|al|ar|en|on|or|le|te|ty|ry|ey|ay|oy|ow|ew|ck|ll|ss|nd|nt|st|rd|ld|th|ch|sh|ft|pt|ct|lt|rt|ght|gh)$/i;

function looksLikeCutToken(token: string): boolean {
	if (/[.!?][A-Za-z0-9]/.test(token)) return true;
	const word = token.replace(/[^A-Za-z]/g, '');
	if (!word) return false;
	if (/tournamen$/i.test(word)) return true;
	const segments = token.split('-').map((part) => part.replace(/[^A-Za-z]/g, '')).filter(Boolean);
	const tail = segments[segments.length - 1] ?? word;
	if (segments.length > 1 && tail.length > 0 && tail.length < 5) return true;
	if (word.length <= 3) return true;
	if (!/[aeiouy]/i.test(word)) return true;
	if (FINISHED_WORD.test(word)) return false;
	return true;
}

function dropDanglingToken(text: string): string {
	const lastSpace = text.lastIndexOf(' ');
	if (lastSpace <= 0) return text;
	const last = text.slice(lastSpace + 1);
	if (!looksLikeCutToken(last)) return text;
	const punct = last.match(/^(.*?[.!?])[A-Za-z0-9].*$/);
	if (punct) return `${text.slice(0, lastSpace + 1)}${punct[1]}`.trimEnd();
	return text.slice(0, lastSpace).trimEnd();
}

function withEllipsis(text: string): string {
	const out = text.replace(/[,:;–—-]+$/u, '').trimEnd();
	if (!out) return text;
	if (/[.!?…]$/.test(out)) return out;
	return `${out}…`;
}

/**
 * Show catalog feature copy without mid-word cuts.
 * Strings already at or under `max` are returned unchanged, except hard-sliced
 * ingest leftovers (exact 120/140 chars, no closing punctuation), which lose a
 * dangling fragment and gain an ellipsis.
 */
export function truncateOnWordBoundary(text: string, max = FEATURE_DISPLAY_MAX): string {
	const clean = text.replace(/\s+/g, ' ').trim();
	if (!clean) return clean;

	const hardSliced =
		HARD_SLICE_LENGTHS.has(clean.length) && !/[.!?…)]$/.test(clean) && /\w$/.test(clean);
	const source = hardSliced ? dropDanglingToken(clean) : clean;
	const needsEllipsis = hardSliced;

	if (source.length <= max) {
		return needsEllipsis ? withEllipsis(source) : source;
	}

	const slice = source.slice(0, max);
	const boundary = slice.lastIndexOf(' ');
	const cut = (boundary > 40 ? slice.slice(0, boundary) : slice).trimEnd();
	return withEllipsis(cut);
}
