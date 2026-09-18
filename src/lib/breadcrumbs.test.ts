import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	GUIDES_INDEX_PATH,
	guideArticleBreadcrumbs,
	hrefForBreadcrumb,
	normalizeBreadcrumbItems,
} from './breadcrumbs.ts';

test('guide article breadcrumbs are Home / Guides / title', () => {
	assert.deepEqual(guideArticleBreadcrumbs('Best Pickleball Paddles for Intermediate Players (2026)'), [
		{ label: 'Home', href: '/' },
		{ label: 'Guides', href: GUIDES_INDEX_PATH },
		{ label: 'Best Pickleball Paddles for Intermediate Players (2026)' },
	]);
});

test('normalizeBreadcrumbItems strips gear category crumbs from guide trails', () => {
	const items = [
		{ label: 'Home', href: '/' },
		{ label: 'Guides', href: GUIDES_INDEX_PATH },
		{ label: 'paddles', href: '/gear/paddles' },
		{ label: 'Best Pickleball Paddles for Intermediate Players (2026) in the US' },
	];
	assert.deepEqual(normalizeBreadcrumbItems(items), [
		{ label: 'Home', href: '/' },
		{ label: 'Guides', href: GUIDES_INDEX_PATH },
		{ label: 'Best Pickleball Paddles for Intermediate Players (2026) in the US' },
	]);
});

test('normalizeBreadcrumbItems strips non-gear category crumbs from guide trails', () => {
	const items = [
		{ label: 'Home', href: '/' },
		{ label: 'Guides', href: '/guides' },
		{ label: 'rules', href: '/guides?category=rules' },
		{ label: 'Kitchen Rule Explained' },
	];
	assert.deepEqual(normalizeBreadcrumbItems(items), [
		{ label: 'Home', href: '/' },
		{ label: 'Guides', href: GUIDES_INDEX_PATH },
		{ label: 'Kitchen Rule Explained' },
	]);
});

test('fall-league style trail stays Home / Guides / title', () => {
	const items = [
		{ label: 'Home', href: '/' },
		{ label: 'Guides', href: '/guides' },
		{ label: 'guides', href: '/guides' },
		{ label: 'Fall League Pickleball Starter Kit (2026)' },
	];
	assert.deepEqual(normalizeBreadcrumbItems(items), [
		{ label: 'Home', href: '/' },
		{ label: 'Guides', href: GUIDES_INDEX_PATH },
		{ label: 'Fall League Pickleball Starter Kit (2026)' },
	]);
});

test('guides index trail is unchanged', () => {
	assert.deepEqual(normalizeBreadcrumbItems([{ label: 'Home', href: '/' }, { label: 'Guides' }]), [
		{ label: 'Home', href: '/' },
		{ label: 'Guides' },
	]);
});

test('gear catalog breadcrumbs keep the category segment', () => {
	const items = [{ label: 'Home', href: '/' }, { label: 'Gear' }, { label: 'paddles' }];
	assert.deepEqual(normalizeBreadcrumbItems(items), items);
});

test('Guides-labeled crumbs never keep a gear href', () => {
	assert.equal(hrefForBreadcrumb('Guides', '/gear/paddles'), GUIDES_INDEX_PATH);
});
