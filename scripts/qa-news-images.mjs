/**
 * Fail the build if a news post is missing its hero file, still hotlinks
 * Wikimedia, or embeds Special:FilePath in the body.
 */
import fs from 'node:fs';
import path from 'node:path';

const newsDir = 'src/content/news';
const failures = [];

function parseFrontmatter(raw) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return { fm: '', body: raw };
	return { fm: match[1], body: raw.slice(match[0].length) };
}

function field(fm, name) {
	const quoted = fm.match(new RegExp(`^${name}:\\s*["']([^"']+)["']`, 'm'));
	if (quoted) return quoted[1].trim();
	const plain = fm.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
	return plain ? plain[1].trim().replace(/^["']|["']$/g, '') : '';
}

for (const name of fs.readdirSync(newsDir).sort()) {
	if (!/\.(md|mdx)$/i.test(name)) continue;
	const file = path.join(newsDir, name);
	const raw = fs.readFileSync(file, 'utf8');
	const { fm, body } = parseFrontmatter(raw);
	const src = field(fm, 'image') || field(fm, 'heroImage');
	const alt = field(fm, 'imageAlt') || field(fm, 'heroAlt');

	if (!src) failures.push(`${file}: missing image / heroImage`);
	if (!alt) failures.push(`${file}: missing imageAlt / heroAlt`);
	if (/wikimedia\.org|Special:FilePath/i.test(src)) {
		failures.push(`${file}: Wikimedia hotlink in image field — download to public/images/news/`);
	}
	if (/Special:FilePath|commons\.wikimedia\.org\/wiki\/Special/i.test(body)) {
		failures.push(`${file}: Wikimedia FilePath still in body — use the template hero, not an inline image`);
	}
	const beachLike = `${src} ${alt} ${field(fm, 'imageSource')} ${field(fm, 'imageCredit')}`;
	if (
		/sandy-pickle|sandypickle|sandy_pickle|proplayerstour|sand court|beach court|beach paddle|on sand|ocean/i.test(
			beachLike,
		)
	) {
		failures.push(`${file}: beach/sand hero — use a hard-court pickleball photo (no Sandy Pickle)`);
	}
	if (src.startsWith('/images/')) {
		const onDisk = path.join('public', src.replace(/^\//, ''));
		if (!fs.existsSync(onDisk)) {
			failures.push(`${file}: local image missing on disk → ${onDisk}`);
		}
	}
}

if (failures.length) {
	console.error(`qa-news-images: ${failures.length} failure(s)\n${failures.join('\n')}`);
	process.exit(1);
}

console.log('qa-news-images: ok');
