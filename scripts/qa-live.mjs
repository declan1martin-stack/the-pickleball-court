/**
 * Spot-check the LIVE site for key pages, affiliate tags, and product image HTTP 200s.
 */
const SITE = process.env.LIVE_SITE || 'https://thepickleballcourt.ca';
const tag = 'thepickleb050-20';
const failures = [];

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ThePickleballCourt-QA/1.0' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return { url: res.url, html: await res.text(), status: res.status };
}

async function headOk(url) {
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { 'User-Agent': 'ThePickleballCourt-QA/1.0' },
    redirect: 'follow',
  });
  // Some CDNs dislike HEAD — fall back to GET range
  if (res.ok) return true;
  const get = await fetch(url, {
    headers: { 'User-Agent': 'ThePickleballCourt-QA/1.0', Range: 'bytes=0-0' },
    redirect: 'follow',
  });
  return get.ok || get.status === 206;
}

const pages = [
	'/',
	'/gear/paddles',
	'/gear/shoes',
	'/gear/nets',
	'/gear/balls',
	'/gear/bags',
	'/gear/apparel',
	'/gear/accessories',
	'/guides/best-pickleball-paddles-for-beginners',
];

console.log(`Live QA against ${SITE}`);

for (const path of pages) {
  try {
    const { html } = await fetchText(SITE + path);
    const amazon = [...html.matchAll(/href="(https?:\/\/[^"]*amazon\.[^"]*)"/gi)].map((m) => m[1]);
    for (const href of amazon) {
      if (!href.includes(`tag=${tag}`)) failures.push(`${path}: missing tag → ${href}`);
    }
    const imgs = [...html.matchAll(/src="(\/images\/products\/[^"]+)"/g)].map((m) => m[1]);
    const sample = [...new Set(imgs)].slice(0, 8);
    for (const src of sample) {
      const ok = await headOk(SITE + src);
      if (!ok) failures.push(`${path}: image not OK → ${src}`);
    }
    console.log(`OK  ${path}  amazonLinks=${amazon.length} sampleImages=${sample.length}`);
  } catch (e) {
    failures.push(`${path}: ${e.message}`);
    console.log(`FAIL ${path}`);
  }
}

if (failures.length) {
  console.error('\nLIVE QA FAILED\n' + failures.join('\n'));
  process.exit(1);
}
console.log('\nLIVE QA OK');
