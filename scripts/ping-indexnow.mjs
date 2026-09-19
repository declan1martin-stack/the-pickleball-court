#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing / Yandex / others).
 *
 * Key: public/<INDEXNOW_KEY>.txt (file body = key). Repo key is
 * e5fdb4b489461004ccd84ae7e188ac12 and is auto-detected when env is unset.
 *
 * Usage:
 *   npm run ping:indexnow              # CA + US sitemaps
 *   npm run ping:indexnow:us           # US sitemap
 *   npm run ping:indexnow:ca           # CA sitemap
 *   npm run ping:indexnow:us:daily     # one high-intent US guide (fall-league kit)
 *
 *   node scripts/ping-indexnow.mjs --url=https://uspickleballcourt.com/guides/fall-league-pickleball-starter-kit
 *   node scripts/ping-indexnow.mjs --key=... --host=uspickleballcourt.com
 *   node scripts/ping-indexnow.mjs --both
 *
 * Documented curl (same key + URL as ping:indexnow:us:daily):
 *   curl -X POST https://api.indexnow.org/indexnow \
 *     -H 'Content-Type: application/json; charset=utf-8' \
 *     -d '{"host":"uspickleballcourt.com","key":"e5fdb4b489461004ccd84ae7e188ac12","keyLocation":"https://uspickleballcourt.com/e5fdb4b489461004ccd84ae7e188ac12.txt","urlList":["https://uspickleballcourt.com/guides/fall-league-pickleball-starter-kit"]}'
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_INDEXNOW_KEY = 'e5fdb4b489461004ccd84ae7e188ac12';
const US_DAILY_GUIDE =
	'https://uspickleballcourt.com/guides/fall-league-pickleball-starter-kit';

const args = process.argv.slice(2);
const getArg = (name) => {
	const hit = args.find((a) => a.startsWith(`--${name}=`));
	return hit ? hit.slice(name.length + 3) : undefined;
};

function discoverKey() {
	const fromArg = getArg('key');
	if (fromArg) return fromArg.trim();
	const fromEnv = (process.env.INDEXNOW_KEY || '').trim();
	if (fromEnv) return fromEnv;

	const publicDir = resolve(process.cwd(), 'public');
	const repoFile = resolve(publicDir, `${REPO_INDEXNOW_KEY}.txt`);
	if (existsSync(repoFile) && readFileSync(repoFile, 'utf8').trim() === REPO_INDEXNOW_KEY) {
		return REPO_INDEXNOW_KEY;
	}

	if (!existsSync(publicDir)) return '';
	for (const file of readdirSync(publicDir)) {
		if (!file.endsWith('.txt')) continue;
		const name = file.slice(0, -4);
		if (!/^[a-f0-9]{32}$/i.test(name)) continue;
		const body = readFileSync(resolve(publicDir, file), 'utf8').trim();
		if (body === name) return name;
	}
	return '';
}

const key = discoverKey();
const both = args.includes('--both');
const hostArg = getArg('host');
const dailyUsGuide = args.includes('--daily-us-guide');
const urlArgs = args
	.filter((a) => a.startsWith('--url='))
	.map((a) => a.slice('--url='.length).trim())
	.filter(Boolean);

if (dailyUsGuide) urlArgs.push(US_DAILY_GUIDE);

const uniqueUrls = [...new Set(urlArgs)];

if (!key || key.length < 8) {
	console.error('Missing INDEXNOW_KEY (or --key=). Generate with: openssl rand -hex 16');
	process.exit(1);
}

const keyFile = resolve(process.cwd(), 'public', `${key}.txt`);
if (!existsSync(keyFile)) {
	console.error(`Key file missing: public/${key}.txt (file body must equal the key)`);
	process.exit(1);
}

function hostFromUrl(url) {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return '';
	}
}

const hosts = both
	? ['thepickleballcourt.ca', 'uspickleballcourt.com']
	: [
			hostArg ||
				(urlArgs[0] && hostFromUrl(urlArgs[0])) ||
				(process.env.PUBLIC_SITE_REGION === 'us' ? 'uspickleballcourt.com' : 'thepickleballcourt.ca'),
		];

async function urlsForHost(host) {
	if (uniqueUrls.length) {
		const filtered = uniqueUrls.filter((url) => hostFromUrl(url) === host);
		return filtered.length ? filtered : uniqueUrls;
	}
	const sitemapUrl = `https://${host}/sitemap-0.xml`;
	const res = await fetch(sitemapUrl);
	if (!res.ok) throw new Error(`Failed to fetch ${sitemapUrl}: ${res.status}`);
	const xml = await res.text();
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function submit(host, urlList) {
	const keyLocation = `https://${host}/${key}.txt`;
	const endpoint = 'https://api.indexnow.org/indexnow';
	const body = { host, key, keyLocation, urlList };
	const res = await fetch(endpoint, {
		method: 'POST',
		headers: { 'content-type': 'application/json; charset=utf-8' },
		body: JSON.stringify(body),
	});
	const text = await res.text().catch(() => '');
	return { status: res.status, text, count: urlList.length };
}

for (const host of hosts) {
	const urls = await urlsForHost(host);
	if (!urls.length) {
		console.warn(`[${host}] no URLs to submit`);
		continue;
	}
	const batchSize = 100;
	for (let i = 0; i < urls.length; i += batchSize) {
		const batch = urls.slice(i, i + batchSize);
		const result = await submit(host, batch);
		console.log(
			`[${host}] submitted ${result.count} urls → HTTP ${result.status}${result.text ? ` ${result.text}` : ''}`,
		);
		if (![200, 202].includes(result.status)) {
			process.exitCode = 1;
		}
	}
}
