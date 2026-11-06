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

const allText = htmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const selkirk = [...allText.matchAll(/selkirk\.com\/search\?q=([^"&]+)/g)].map((m) => decodeURIComponent(m[1].replace(/\+/g, ' ')));
for (const query of selkirk) {
	if (/selkirk\s+selkirk/i.test(query)) failures.push(`doubled Selkirk search query: ${query}`);
}

console.log(`Checked ${pagesChecked} HTML files, ${routes.size} routes, ${selkirk.length} Selkirk search links.`);
if (failures.length) {
	console.error(`\n${failures.length} failure(s):`);
	for (const failure of failures.slice(0, 80)) console.error(' - ' + failure);
	if (failures.length > 80) console.error(` ... and ${failures.length - 80} more`);
	process.exit(1);
}
console.log('dist SEO checks passed.');
