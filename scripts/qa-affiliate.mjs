import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
const tag = 'thepickleb050-20';
const failures = [];

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
	for (const href of amazonHrefs) {
		if (!href.includes(`tag=${tag}`)) {
			failures.push(`${file}: Amazon URL missing tag → ${href}`);
		}
	}
	const affiliateAnchors = [...html.matchAll(/<a\b[^>]*href="https?:\/\/[^"]*amazon\.[^"]*"[^>]*>/gi)];
	for (const [anchor] of affiliateAnchors) {
		if (!/rel="[^"]*sponsored[^"]*nofollow[^"]*noopener[^"]*"/.test(anchor) &&
			!(/rel="[^"]*sponsored/.test(anchor) && /nofollow/.test(anchor) && /noopener/.test(anchor))) {
			// Allow any order of the three tokens inside rel=
			const rel = anchor.match(/rel="([^"]*)"/)?.[1] ?? '';
			const ok = rel.includes('sponsored') && rel.includes('nofollow') && rel.includes('noopener');
			if (!ok) failures.push(`${file}: Amazon anchor missing required rel → ${anchor.slice(0, 180)}`);
		}
		if (!/target="_blank"/.test(anchor)) {
			failures.push(`${file}: Amazon anchor missing target=_blank`);
		}
	}
}

if (!fs.existsSync(dist)) {
	console.error('dist/ missing — run npm run build first');
	process.exit(1);
}

walk(dist);

if (failures.length) {
	console.error('QA FAILED\n' + failures.join('\n'));
	process.exit(1);
}

console.log(`QA OK — Amazon links use tag=${tag} with sponsored/nofollow/noopener + target=_blank`);
