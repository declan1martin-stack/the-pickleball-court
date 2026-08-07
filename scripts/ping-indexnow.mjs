#!/usr/bin/env node
/**
 * Submit sitemap URLs to IndexNow (Bing / Yandex / others).
 * Requires public/<INDEXNOW_KEY>.txt (file body = key) and INDEXNOW_KEY env,
 * or pass --key=.
 *
 * Usage:
 *   INDEXNOW_KEY=... node scripts/ping-indexnow.mjs
 *   node scripts/ping-indexnow.mjs --key=... --host=thepickleballcourt.ca
 *   node scripts/ping-indexnow.mjs --both   # CA + US hosts
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name) => {
	const hit = args.find((a) => a.startsWith(`--${name}=`));
	return hit ? hit.slice(name.length + 3) : undefined;
};

const key = (getArg('key') || process.env.INDEXNOW_KEY || '').trim();
const both = args.includes('--both');
const hostArg = getArg('host');

if (!key || key.length < 8) {
	console.error('Missing INDEXNOW_KEY (or --key=). Generate with: openssl rand -hex 16');
	process.exit(1);
}

const keyFile = resolve(process.cwd(), 'public', `${key}.txt`);
if (!existsSync(keyFile)) {
	console.error(`Key file missing: public/${key}.txt (file body must equal the key)`);
	process.exit(1);
}

const hosts = both
	? ['thepickleballcourt.ca', 'uspickleballcourt.com']
	: [hostArg || (process.env.PUBLIC_SITE_REGION === 'us' ? 'uspickleballcourt.com' : 'thepickleballcourt.ca')];

async function urlsForHost(host) {
	const sitemapUrl = `https://${host}/sitemap-0.xml`;
	const res = await fetch(sitemapUrl);
	if (!res.ok) throw new Error(`Failed to fetch ${sitemapUrl}: ${res.status}`);
	const xml = await res.text();
	const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
	return urls;
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
		console.warn(`[${host}] no URLs in sitemap`);
		continue;
	}
	// IndexNow allows up to 10k; batch anyway for safety.
	const batchSize = 100;
	for (let i = 0; i < urls.length; i += batchSize) {
		const batch = urls.slice(i, i + batchSize);
		const result = await submit(host, batch);
		console.log(`[${host}] submitted ${result.count} urls → HTTP ${result.status}${result.text ? ` ${result.text}` : ''}`);
		if (![200, 202].includes(result.status)) {
			process.exitCode = 1;
		}
	}
}
