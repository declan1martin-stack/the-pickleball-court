/**
 * Mark <li> nodes whose only non-whitespace content is a single <a>
 * (optionally wrapped in one <p>) with class="whole-item".
 * Used so 44px list-link hit targets do not apply to mixed-prose bullets
 * that CSS :only-child would still match (text nodes are ignored by :only-child).
 *
 * Anchor attributes/classes do not matter — a lone <a class="…"> still counts.
 * MDX components that compile to a sole <a> (NewsLink in news Keep reading)
 * appear as mdxJsx*Element in this tree, not as <a>, so they are treated
 * the same way.
 */
import { visit } from 'unist-util-visit';

function isElement(node, tagName) {
	return node?.type === 'element' && node.tagName === tagName;
}

function isMdxJsxElement(node) {
	return node?.type === 'mdxJsxFlowElement' || node?.type === 'mdxJsxTextElement';
}

/** Sole content that is (or will render as) one anchor — classes/attrs ignored. */
function isSoleAnchorLike(node) {
	if (isElement(node, 'a')) return true;
	// NewsLink.astro renders a single <a class="font-semibold text-primary underline">.
	if (isMdxJsxElement(node) && node.name === 'NewsLink') return true;
	return false;
}

function significantChildren(nodes = []) {
	return nodes.filter((node) => {
		if (node.type === 'text') return /\S/.test(node.value);
		if (node.type === 'comment') return false;
		return true;
	});
}

function addClass(node, className) {
	const props = (node.properties ??= {});
	const current = props.className;
	const list = Array.isArray(current)
		? current.map(String)
		: typeof current === 'string'
			? current.split(/\s+/).filter(Boolean)
			: [];
	if (!list.includes(className)) list.push(className);
	props.className = list;
}

function isWholeItemList(node) {
	const kids = significantChildren(node.children);
	if (kids.length === 1 && isSoleAnchorLike(kids[0])) return true;
	if (kids.length === 1 && isElement(kids[0], 'p')) {
		const pKids = significantChildren(kids[0].children);
		return pKids.length === 1 && isSoleAnchorLike(pKids[0]);
	}
	return false;
}

export default function rehypeWholeItemList() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'li') return;
			if (isWholeItemList(node)) addClass(node, 'whole-item');
		});
	};
}
