export type InlinePart =
	| { kind: 'text'; value: string }
	| { kind: 'strong'; value: string };

/**
 * Minimal `**bold**` support for frontmatter strings (quick answers).
 * Keeps literal asterisks out of the rendered HTML.
 */
export function inlineStrongParts(input: string): InlinePart[] {
	const parts: InlinePart[] = [];
	const re = /\*\*([^*]+)\*\*/g;
	let last = 0;
	for (const match of input.matchAll(re)) {
		const index = match.index ?? 0;
		if (index > last) parts.push({ kind: 'text', value: input.slice(last, index) });
		parts.push({ kind: 'strong', value: match[1] });
		last = index + match[0].length;
	}
	if (last < input.length) parts.push({ kind: 'text', value: input.slice(last) });
	if (parts.length === 0) parts.push({ kind: 'text', value: input });
	return parts;
}
