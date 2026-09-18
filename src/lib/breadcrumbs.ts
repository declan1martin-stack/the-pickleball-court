export interface BreadcrumbItem {
	label: string;
	href?: string;
}

export const GUIDES_INDEX_PATH = '/guides';

export function isGuidesCrumbLabel(label: string): boolean {
	return label.trim().toLowerCase() === 'guides';
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

export function normalizeBreadcrumbItems(items: BreadcrumbItem[]): BreadcrumbItem[] {
	return items.map((item) => ({
		...item,
		href: hrefForBreadcrumb(item.label, item.href),
	}));
}
