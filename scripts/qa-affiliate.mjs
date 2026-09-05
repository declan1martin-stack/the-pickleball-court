import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
const region = (process.env.PUBLIC_SITE_REGION || 'ca').toString().trim().toLowerCase() === 'us' ? 'us' : 'ca';
const tag = region === 'us' ? 'uspickleball-20' : 'thepickleb050-20';
const amazonHost = region === 'us' ? 'amazon.com' : 'amazon.ca';
const failures = [];
const gear = JSON.parse(fs.readFileSync('src/data/gear.json', 'utf8'));

function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (entry.name.endsWith('.html')) checkHtml(full);
	}
}

function checkHtml(file) {
	const html = fs.readFileSync(file, 'utf8');
	const amazonHrefs = [...html.matchAll(/href="(https?:\/\/[^"]*amazon\.[^"]*)"/gi)].map((m) => m[1]);
	const wrongHost = region === 'us' ? 'amazon.ca' : 'amazon.com';
	const wrongTag = region === 'us' ? 'thepickleb050-20' : 'uspickleball-20';
	for (const href of amazonHrefs) {
		if (!href.includes(`tag=${tag}`)) {
			failures.push(`${file}: Amazon URL missing tag → ${href}`);
		}
		if (!href.includes(amazonHost)) {
			failures.push(`${file}: Amazon URL wrong marketplace (want ${amazonHost}) → ${href}`);
		}
		if (href.includes(wrongHost)) {
			failures.push(`${file}: cross-region leak (${wrongHost}) → ${href}`);
		}
		if (href.includes(wrongTag)) {
			failures.push(`${file}: cross-region tag leak (${wrongTag}) → ${href}`);
		}
	}
	if (region === 'us') {
		if (html.includes('thepickleballcourt.ca') && !file.includes('node_modules')) {
			// Allow only if somehow referencing the other brand intentionally — flag canonical/site leaks
			if (/canonical[^>]+thepickleballcourt\.ca|og:site_name[^>]+ThePickleballCourt\.ca/i.test(html)) {
				failures.push(`${file}: US build still has CA canonical/site_name`);
			}
		}
		if (html.includes(`tag=${wrongTag}`)) {
			failures.push(`${file}: US HTML contains CA Associates tag`);
		}
	} else if (html.includes(`tag=${wrongTag}`)) {
		failures.push(`${file}: CA HTML contains US Associates tag`);
	}
	const affiliateAnchors = [
		...html.matchAll(/<a\b[^>]*data-affiliate="retail"[^>]*>/gi),
		...html.matchAll(/<a\b[^>]*href="https?:\/\/[^"]*amazon\.[^"]*"[^>]*>/gi),
	];
	const seen = new Set();
	for (const [anchor] of affiliateAnchors) {
		if (seen.has(anchor)) continue;
		seen.add(anchor);
		const rel = anchor.match(/rel="([^"]*)"/)?.[1] ?? '';
		const ok = rel.includes('sponsored') && rel.includes('nofollow') && rel.includes('noopener');
		if (!ok) failures.push(`${file}: affiliate anchor missing required rel → ${anchor.slice(0, 180)}`);
		if (!/target="_blank"/.test(anchor)) {
			failures.push(`${file}: affiliate anchor missing target=_blank`);
		}
	}

	// Partner CTAs: PBS is Canada-only; Selkirk can appear on both hosts.
	const isGearPage = /[/\\]gear[/\\]/.test(file) && (file.endsWith('.html'));
	if (isGearPage && /gear[/\\]paddles\.html$/.test(file) && !html.includes('Shop at Selkirk')) {
		failures.push(`${file}: missing Selkirk partner CTA on paddles page`);
	}
	if (isGearPage && region === 'ca' && !html.includes('Shop Pickleball Superstore')) {
		failures.push(`${file}: missing Pickleball Superstore partner CTA`);
	}
	if (isGearPage && region === 'us' && html.includes('Shop Pickleball Superstore')) {
		failures.push(`${file}: US build leaked Pickleball Superstore CTA`);
	}
}

function extractAsin(url) {
	return url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1] ?? null;
}

/** Same ASIN only when we verified the listing on both marketplaces. */
const SHARED_ASINS = new Set([
	'B09VCV2XWK', // JOOLA Vision C15
	'B00EM2WSW0', // Tourna Mega Tac 3-pack
	'B07XMKF4NM', // Franklin portable regulation net
]);

function checkCatalog() {
	for (const product of gear) {
		const urls = product.affiliateUrls || {};
		const ca = urls.ca || '';
		const us = urls.us || '';
		if (!ca.includes('amazon.ca') || !ca.includes('tag=thepickleb050-20')) {
			failures.push(`gear.json:${product.id}: affiliateUrls.ca must be amazon.ca + thepickleb050-20 → ${ca}`);
		}
		if (!us.includes('amazon.com') || !us.includes('tag=uspickleball-20')) {
			failures.push(`gear.json:${product.id}: affiliateUrls.us must be amazon.com + uspickleball-20 → ${us}`);
		}
		const caAsin = extractAsin(ca);
		const usAsin = extractAsin(us);
		if (caAsin && usAsin && caAsin === usAsin && !SHARED_ASINS.has(caAsin)) {
			failures.push(
				`gear.json:${product.id}: same ASIN ${caAsin} copied across CA and US — ASINs are marketplace-specific`,
			);
		}
		if (!product.imageUrl?.startsWith('/images/products/')) {
			failures.push(`gear.json:${product.id}: imageUrl is not a local /images/products/ path → ${product.imageUrl}`);
			continue;
		}
		const filePath = path.join('public', product.imageUrl);
		if (!fs.existsSync(filePath)) {
			failures.push(`gear.json:${product.id}: missing image file ${filePath}`);
		}
		if (product.todo) {
			failures.push(`gear.json:${product.id}: unresolved todo → ${product.todo}`);
		}
	}
}

if (!fs.existsSync(dist)) {
	console.error('dist/ missing — run npm run build first');
	process.exit(1);
}

checkCatalog();
walk(dist);

if (failures.length) {
	console.error('QA FAILED\n' + failures.join('\n'));
	process.exit(1);
}

console.log(
	`QA OK — region=${region} ${gear.length} products: HTML Amazon tag=${tag} host=${amazonHost}, local images present, anchors use sponsored/nofollow/noopener + target=_blank`,
);
