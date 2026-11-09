/**
 * Post-build checks for the US-only, non-trailing-slash host.
 * Usage: node scripts/verify-dist-seo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
const failures = [];
const htmlFiles = [];

function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (entry.name.endsWith('.html')) htmlFiles.push(full);
	}
}

if (!fs.existsSync(dist)) {
	console.error('dist/ is missing. Run npm run build first.');
	process.exit(1);
}

walk(dist);

const routes = new Set();
for (const file of htmlFiles) {
	const rel = path.relative(dist, file).split(path.sep).join('/');
	if (rel === 'index.html') routes.add('/');
	else if (rel === '404.html') routes.add('/404');
	else routes.add('/' + rel.replace(/\.html$/, ''));
}

const publicFiles = new Set();
function walkPublic(dir, prefix = '') {
	if (!fs.existsSync(dir)) return;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) walkPublic(path.join(dir, entry.name), rel);
		else publicFiles.add('/' + rel);
	}
}
walkPublic('public');

function routeExists(href) {
	const clean = href.length > 1 ? href.replace(/\/+$/, '') : href;
	if (routes.has(clean) || routes.has(href)) return true;
	if (publicFiles.has(clean) || publicFiles.has(href)) return true;
	const rel = clean.replace(/^\//, '');
	if (!rel) return true;
	if (fs.existsSync(path.join(dist, rel)) || fs.existsSync(path.join(dist, `${rel}.html`))) return true;
	if (fs.existsSync(path.join('public', rel))) return true;
	return false;
}

function isStubPage(file) {
	const base = path.basename(file);
	return /^google[a-z0-9]+\.html$/i.test(base) || base === 'avantlink-verify.html';
}

const assoc = 'As an Amazon Associate I earn from qualifying purchases.';
let pagesChecked = 0;

for (const file of htmlFiles) {
	if (isStubPage(file)) continue;
	const html = fs.readFileSync(file, 'utf8');
	pagesChecked += 1;
	const rel = path.relative(dist, file);

	if (html.includes('thepickleballcourt.ca')) failures.push(`${rel}: contains thepickleballcourt.ca`);
	if (html.includes('thepickleb050-20')) failures.push(`${rel}: contains thepickleb050-20`);
	if (/hreflang="en-CA"/i.test(html) || /hreflang="en-ca"/i.test(html)) {
		failures.push(`${rel}: contains hreflang en-CA`);
	}
	if (!html.includes('G-WE9TTJLH00')) failures.push(`${rel}: missing G-WE9TTJLH00`);

	const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
	if (!canonical) failures.push(`${rel}: missing canonical`);
	else {
		if (!canonical.startsWith('https://uspickleballcourt.com')) {
			failures.push(`${rel}: canonical is not the US host → ${canonical}`);
		}
		const url = new URL(canonical);
		if (url.pathname !== '/' && url.pathname.endsWith('/')) {
			failures.push(`${rel}: canonical has a trailing slash → ${canonical}`);
		}
		const expectedPath = routes.has('/') && rel === 'index.html' ? '/' : '/' + rel.replace(/\.html$/, '').replace(/\\/g, '/');
		const normalizedExpected = expectedPath === '/404.html' ? '/404' : expectedPath;
		if (rel !== '404.html' && url.pathname !== (rel === 'index.html' ? '/' : '/' + rel.replace(/\.html$/, ''))) {
			failures.push(`${rel}: canonical path ${url.pathname} does not match file`);
		}
		void normalizedExpected;
	}

	const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
	for (const [, lang, href] of hreflangs) {
		if (lang !== 'en-US' && lang !== 'x-default') {
			failures.push(`${rel}: unexpected hreflang ${lang} → ${href}`);
		}
		if (!href.startsWith('https://uspickleballcourt.com')) {
			failures.push(`${rel}: hreflang ${lang} is not the US host → ${href}`);
		}
	}
	if (!hreflangs.some(([, lang]) => lang === 'en-US') || !hreflangs.some(([, lang]) => lang === 'x-default')) {
		failures.push(`${rel}: missing en-US or x-default hreflang`);
	}

	const footer = html.match(/<footer\b[\s\S]*<\/footer>/i)?.[0] ?? '';
	const withoutFooter = html.replace(/<footer\b[\s\S]*<\/footer>/i, '');
	if (!footer.includes(assoc)) failures.push(`${rel}: Associates sentence missing from footer`);
	if (withoutFooter.includes(assoc)) failures.push(`${rel}: Associates sentence appears outside footer`);

	const internal = [...html.matchAll(/<a\b[^>]*href="(\/[^"]*)"/g)].map((m) => m[1]);
	for (const href of internal) {
		const [pathOnly, hash] = href.split('#');
		const queryless = pathOnly.split('?')[0];
		if (queryless.length > 1 && queryless.endsWith('/')) {
			failures.push(`${rel}: trailing-slash internal link ${href}`);
		}
		if (queryless.startsWith('/go/')) {
			failures.push(`${rel}: internal redirect hop ${href}`);
		}
		if (!routeExists(queryless) && queryless !== '/') {
			failures.push(`${rel}: internal link 404 ${href}${hash ? '#' + hash : ''}`);
		}
	}

	if (/"@type"\s*:\s*"Offer"/.test(html) || /"@type":"Offer"/.test(html)) {
		failures.push(`${rel}: emits an Offer object`);
	}
}

const gear = JSON.parse(fs.readFileSync('src/data/gear.json', 'utf8'));
const clipWidths = new Set([116, 119, 120, 140]);
const danglingWord =
	/(?:^|[\s(])(?:and|or|with|for|to|of|in|on|from|by|at|as|via|into|over|your|its|their|our|including|plus|featuring|the|a|an|but|nor|so|yet|than|per|without|within|about|during|while|although|because|if|when|where|which|that|this|these|those|both|either|just|&)\s*$/i;
const brokenEntity = /&#|&amp;|&lt;|&gt;|&quot;|&nbsp;|con\/tact/i;
const midWordEnding =
	/(?:tournamen|lightweig|comfortabl|includin|slidin|high-cont|ensu|appl|athl|padde|tenni|materi|addi|bui|pai|rotationally)$/i;
const shortTokenOk = new Set(['us', 'ok', 'xl', 'xs', 'mm', 'ml', 'no', 'go', 'up', 'iv', 'id', 'oz']);

function catalogCopyIssue(text) {
	const value = String(text ?? '').trim();
	if (!value) return null;
	if (brokenEntity.test(value)) return 'broken HTML entity';
	if (/[,:;]$/.test(value)) return 'dangling punctuation';
	if (danglingWord.test(value)) return 'dangling word';
	if (clipWidths.has(value.length) && !/[.!?]$/.test(value)) {
		return `scraper cutoff at ${value.length} characters`;
	}
	if (!/[.!?]$/.test(value)) {
		const last = value.split(/\s+/).pop().replace(/^[^A-Za-z0-9+]+|[^A-Za-z0-9+]+$/g, '');
		if (/^[A-Za-z]{1,2}$/.test(last) && !shortTokenOk.has(last.toLowerCase())) {
			return `mid-word fragment "${last}"`;
		}
		if (midWordEnding.test(last)) return `mid-word cutoff "${last}"`;
	}
	return null;
}

for (const product of gear) {
	for (const field of ['name', 'description']) {
		const issue = catalogCopyIssue(product[field]);
		if (issue) failures.push(`gear.json:${product.id}.${field}: ${issue}`);
	}
	const seenFeatures = new Set();
	for (const [index, feature] of (product.features ?? []).entries()) {
		if (seenFeatures.has(feature)) {
			failures.push(`gear.json:${product.id}.features[${index}]: exact duplicate bullet`);
		}
		seenFeatures.add(feature);
		const issue = catalogCopyIssue(feature);
		if (issue) failures.push(`gear.json:${product.id}.features[${index}]: ${issue}`);
	}
}

const categoryLabels = {
	paddles: 'Paddles',
	shoes: 'Shoes',
	nets: 'Nets',
	balls: 'Balls',
	bags: 'Bags',
	apparel: 'Apparel',
	accessories: 'Accessories',
	training: 'Training',
};

function jsonLdBlocks(html) {
	const blocks = [];
	for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
		try {
			blocks.push(JSON.parse(match[1]));
		} catch (error) {
			blocks.push({ __parseError: String(error) });
		}
	}
	return blocks;
}

function breadcrumbLists(node, found = []) {
	if (!node || typeof node !== 'object') return found;
	if (Array.isArray(node)) {
		for (const item of node) breadcrumbLists(item, found);
		return found;
	}
	if (node.__parseError) return found;
	if (node['@graph']) breadcrumbLists(node['@graph'], found);
	if (node['@type'] === 'BreadcrumbList') found.push(node);
	return found;
}

const gearPages = htmlFiles.filter((file) => /^gear\/[^/]+\.html$/.test(path.relative(dist, file).split(path.sep).join('/')));
for (const file of gearPages) {
	const rel = path.relative(dist, file).split(path.sep).join('/');
	const slug = rel.replace(/^gear\//, '').replace(/\.html$/, '');
	const expectedLabel = categoryLabels[slug];
	const html = fs.readFileSync(file, 'utf8');
	if (!expectedLabel) {
		failures.push(`${rel}: unexpected gear category page`);
		continue;
	}
	const nav = html.match(/<nav aria-label="Breadcrumb"[\s\S]*?<\/nav>/i)?.[0] ?? '';
	if (!nav.includes(`>${expectedLabel}<`)) {
		failures.push(`${rel}: visible breadcrumb is missing title-cased "${expectedLabel}"`);
	}
	if (new RegExp(`>${slug}<`).test(nav)) {
		failures.push(`${rel}: visible breadcrumb still uses the raw slug`);
	}
	if (/href="\/gear"(?![\/\w])/.test(nav)) {
		failures.push(`${rel}: breadcrumb links to /gear, which is not a page`);
	}

	const lists = jsonLdBlocks(html).flatMap((block) => breadcrumbLists(block));
	if (lists.length !== 1) {
		failures.push(`${rel}: expected one BreadcrumbList, found ${lists.length}`);
		continue;
	}
	const items = lists[0].itemListElement ?? [];
	if (items.length < 2) failures.push(`${rel}: BreadcrumbList needs Home and ${expectedLabel}`);
	items.forEach((item, index) => {
		const name = item?.name;
		const url = item?.item;
		if (typeof name !== 'string' || !name.trim()) {
			failures.push(`${rel}: BreadcrumbList position ${index + 1} is missing a name`);
		}
		if (typeof url !== 'string' || !url.startsWith('https://uspickleballcourt.com')) {
			failures.push(`${rel}: BreadcrumbList position ${index + 1} is missing a US item URL`);
			return;
		}
		let pathname = '';
		try {
			pathname = new URL(url).pathname.replace(/\/+$/, '') || '/';
		} catch {
			failures.push(`${rel}: BreadcrumbList item is not a valid URL → ${url}`);
			return;
		}
		if (pathname === '/gear') {
			failures.push(`${rel}: BreadcrumbList item points at /gear, which 404s`);
		}
		if (!routeExists(pathname)) {
			failures.push(`${rel}: BreadcrumbList item is not a built route → ${url}`);
		}
		if (index === 0 && (name !== 'Home' || url !== 'https://uspickleballcourt.com')) {
			failures.push(`${rel}: BreadcrumbList Home crumb should be https://uspickleballcourt.com`);
		}
		if (index === items.length - 1) {
			if (name !== expectedLabel) {
				failures.push(`${rel}: final BreadcrumbList name is "${name}", expected "${expectedLabel}"`);
			}
			if (url !== `https://uspickleballcourt.com/gear/${slug}`) {
				failures.push(`${rel}: final BreadcrumbList item is ${url}`);
			}
		}
	});
}

function relHtml(file) {
	return path.relative(dist, file).split(path.sep).join('/');
}

function robotsMeta(html) {
	const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
	for (const tag of metas) {
		if (!/\bname\s*=\s*["']robots["']/i.test(tag)) continue;
		const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
		if (content) return content[1].trim();
	}
	return '';
}

function hasNoindexFollow(html) {
	return /^noindex,\s*follow$/i.test(robotsMeta(html));
}

const sitemapPath = path.join(dist, 'sitemap-0.xml');
if (!fs.existsSync(sitemapPath)) {
	failures.push('sitemap-0.xml is missing');
} else {
	const sitemap = fs.readFileSync(sitemapPath, 'utf8');
	const caLocs = [...sitemap.matchAll(/<loc>([^<]*\/news\/ca-[^<]*)<\/loc>/g)].map((match) => match[1]);
	if (caLocs.length) {
		failures.push(`sitemap-0.xml contains ${caLocs.length} /news/ca- URL(s): ${caLocs.slice(0, 3).join(', ')}`);
	}
}

const caNewsSources = fs
	.readdirSync('src/content/news')
	.filter((name) => /^ca-.*\.(md|mdx)$/i.test(name))
	.map((name) => name.replace(/\.(md|mdx)$/i, ''));
if (caNewsSources.length !== 9) {
	failures.push(`expected 9 src/content/news/ca-* entries, found ${caNewsSources.length}`);
}

for (const slug of caNewsSources) {
	const fileHtml = path.join(dist, 'news', `${slug}.html`);
	const indexHtml = path.join(dist, 'news', slug, 'index.html');
	const built = fs.existsSync(fileHtml) ? fileHtml : fs.existsSync(indexHtml) ? indexHtml : '';
	if (!built) {
		failures.push(`news/${slug}: missing dist HTML (expected news/${slug}.html or news/${slug}/index.html)`);
		continue;
	}
	const html = fs.readFileSync(built, 'utf8');
	if (!hasNoindexFollow(html)) {
		failures.push(`${relHtml(built)}: expected <meta name="robots" content="noindex, follow">, found "${robotsMeta(html) || 'none'}"`);
	}
}

const indexableRoots = [
	'index.html',
	'about.html',
	'affiliate-disclosure.html',
	'contact.html',
	'editorial-policy.html',
	'privacy.html',
	'terms.html',
	'guides.html',
	'news.html',
	'authors/deco.html',
];
for (const rel of indexableRoots) {
	const file = path.join(dist, rel);
	if (!fs.existsSync(file)) {
		failures.push(`${rel}: missing indexable page`);
		continue;
	}
	const html = fs.readFileSync(file, 'utf8');
	if (/noindex/i.test(html)) failures.push(`${rel}: indexable page emits noindex`);
}

for (const file of htmlFiles) {
	const rel = relHtml(file);
	const commercial = rel.startsWith('guides/') || rel.startsWith('gear/');
	const usNews = rel.startsWith('news/') && !rel.startsWith('news/ca-');
	if (!commercial && !usNews) continue;
	const html = fs.readFileSync(file, 'utf8');
	if (/noindex/i.test(html)) failures.push(`${rel}: indexable page emits noindex`);
}

const allText = htmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const selkirk = [...allText.matchAll(/selkirk\.com\/search\?q=([^"&]+)/g)].map((m) => decodeURIComponent(m[1].replace(/\+/g, ' ')));
for (const query of selkirk) {
	if (/selkirk\s+selkirk/i.test(query)) failures.push(`doubled Selkirk search query: ${query}`);
}

console.log(
	`Checked ${pagesChecked} HTML files, ${routes.size} routes, ${gear.length} catalog items, ${gearPages.length} gear breadcrumbs, ${selkirk.length} Selkirk search links.`,
);
if (failures.length) {
	console.error(`\n${failures.length} failure(s):`);
	for (const failure of failures.slice(0, 80)) console.error(' - ' + failure);
	if (failures.length > 80) console.error(` ... and ${failures.length - 80} more`);
	process.exit(1);
}
console.log('dist SEO checks passed.');
