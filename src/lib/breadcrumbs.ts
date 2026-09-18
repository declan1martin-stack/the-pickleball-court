export interface BreadcrumbItem {
	label: string;
	href?: string;
}

export const GUIDES_INDEX_PATH = '/guides';

export function isGuidesCrumbLabel(label: string): boolean {
	return label.trim().toLowerCase() === 'guides';
}

function isGuidesIndexCrumb(item: BreadcrumbItem): boolean {
	if (!isGuidesCrumbLabel(item.label)) return false;
	return item.href === undefined || item.href === GUIDES_INDEX_PATH;
}

/**
 * Canonical trail for a guide article: Home / Guides(/guides) / {page title}.
 */
export function guideArticleBreadcrumbs(title: string): BreadcrumbItem[] {
	return [
		{ label: 'Home', href: '/' },
		{ label: 'Guides', href: GUIDES_INDEX_PATH },
		{ label: title },
	];
}

/**
 * Sitewide rule: a breadcrumb labeled guides/Guides always links to the guides index.
 * Never allow a Guides-labeled crumb to point at a gear catalog (e.g. `/gear/paddles`).
 */
export function hrefForBreadcrumb(label: string, href?: string): string | undefined {
	if (href === undefined) return undefined;
	if (isGuidesCrumbLabel(label)) return GUIDES_INDEX_PATH;
	return href;
}

/**
 * Guide article trails are Home / Guides(/guides) / {page title}.
 * Drop paddles/shoes/rules/etc. category segments that sit between Guides and the title.
 * Catalog pages (Home / Gear / paddles) are unchanged.
 */
function collapseGuideArticleTrail(items: BreadcrumbItem[]): BreadcrumbItem[] {
	const guidesIndex = items.findIndex((item, index) => index > 0 && isGuidesIndexCrumb(item));
	if (guidesIndex === -1 || guidesIndex >= items.length - 1) return items;

	const last = items[items.length - 1];
	if (guidesIndex === items.length - 2) return items;

	return [...items.slice(0, guidesIndex + 1), last];
}

export function normalizeBreadcrumbItems(items: BreadcrumbItem[]): BreadcrumbItem[] {
	const normalized = items.map((item) => {
		const href = hrefForBreadcrumb(item.label, item.href);
		return href === undefined ? { label: item.label } : { label: item.label, href };
	});

	const collapsed: BreadcrumbItem[] = [];
	for (const item of normalized) {
		const prev = collapsed[collapsed.length - 1];
		const duplicateGuidesCrumb =
			prev &&
			isGuidesCrumbLabel(prev.label) &&
			isGuidesCrumbLabel(item.label) &&
			(prev.href ?? GUIDES_INDEX_PATH) === GUIDES_INDEX_PATH &&
			(item.href ?? GUIDES_INDEX_PATH) === GUIDES_INDEX_PATH;
		if (duplicateGuidesCrumb) continue;
		collapsed.push(item);
	}

	return collapseGuideArticleTrail(collapsed);
}
