/**
 * Host-based marketplace + market-copy rewrite for the shared Pages project.
 *
 * - thepickleballcourt.ca → serve build as-is
 * - uspickleballcourt.com → rewrite affiliate hosts/tags, currency labels, and CA→US copy
 *
 * Idempotent with a US-region build (PUBLIC_SITE_REGION=us).
 */

const US_HOSTS = new Set(['uspickleballcourt.com', 'www.uspickleballcourt.com']);

function shouldRewrite(host) {
	return US_HOSTS.has((host || '').toLowerCase());
}

function isRewritable(contentType = '', pathname = '') {
	if (
		contentType.includes('text/html') ||
		contentType.includes('text/plain') ||
		contentType.includes('application/xml') ||
		contentType.includes('text/xml') ||
		contentType.includes('application/rss+xml') ||
		contentType.includes('application/javascript')
	) {
		return true;
	}
	return (
		pathname.endsWith('.xml') ||
		pathname.endsWith('.txt') ||
		pathname.endsWith('.html')
	);
}

function rewriteForUs(body) {
	let next = body
		// Affiliate / host identity
		.replaceAll('https://www.amazon.ca', 'https://www.amazon.com')
		.replaceAll('http://www.amazon.ca', 'https://www.amazon.com')
		.replaceAll('https://amazon.ca', 'https://www.amazon.com')
		.replaceAll('http://amazon.ca', 'https://www.amazon.com')
		.replaceAll('tag=thepickleb050-20', 'tag=uspickleball-20')
		.replaceAll('thepickleb050-20', 'uspickleball-20')
		.replaceAll('https://www.thepickleballcourt.ca', 'https://www.uspickleballcourt.com')
		.replaceAll('http://www.thepickleballcourt.ca', 'https://www.uspickleballcourt.com')
		.replaceAll('https://thepickleballcourt.ca', 'https://uspickleballcourt.com')
		.replaceAll('http://thepickleballcourt.ca', 'https://uspickleballcourt.com')
		.replaceAll('ThePickleballCourt.ca', 'USPickleballCourt.com')
		.replaceAll('hello@thepickleballcourt.ca', 'hello@uspickleballcourt.com')
		.replaceAll('the Canada store', 'the US store')
		.replaceAll('>.ca</span>', '>.com</span>')
		.replaceAll('>.ca<', '>.com<')
		.replaceAll('Pickleball Court.ca', 'Pickleball Court.com')
		// Locale / schema
		.replaceAll('content="en_CA"', 'content="en_US"')
		// Use "html lang=" — never replace bare lang="en-CA" (matches inside hreflang="en-CA").
		.replaceAll('html lang="en-CA"', 'html lang="en-US"')
		.replaceAll('"inLanguage":"en-CA"', '"inLanguage":"en-US"')
		.replaceAll('"areaServed":"CA"', '"areaServed":"US"')
		.replaceAll('"priceCurrency":"CAD"', '"priceCurrency":"USD"')
		// Currency labels in visible copy (keep $ amounts; swap code only)
		.replaceAll(' CAD', ' USD')
		.replaceAll('>CAD<', '>USD<')
		// High-signal page titles / H1s
		.replaceAll('Canadian Pickleball Gear Guides', 'US Pickleball Gear Guides')
		.replaceAll('Canadian Pickleball Gear Hub', 'US Pickleball Gear Hub')
		.replaceAll('Definitive Guide to Canadian Pickleball', 'Definitive Guide to US Pickleball')
		.replaceAll('Canadian Gear Guide', 'US Gear Guide')
		.replaceAll('Best Pickleball Paddles in Canada', 'Best Pickleball Paddles in the US')
		.replaceAll('Best Pickleball Shoes in Canada', 'Best Pickleball Shoes in the US')
		.replaceAll('Best Portable Pickleball Nets in Canada', 'Best Portable Pickleball Nets in the US')
		.replaceAll('Best Pickleball Balls in Canada', 'Best Pickleball Balls in the US')
		.replaceAll('Best Pickleball Bags in Canada', 'Best Pickleball Bags in the US')
		.replaceAll('Best Pickleball Apparel in Canada', 'Best Pickleball Apparel in the US')
		.replaceAll('Best Pickleball Accessories in Canada', 'Best Pickleball Accessories in the US')
		.replaceAll('In-depth Canadian pickleball', 'In-depth US pickleball')
		// Market phrasing (ordered from specific → general)
		.replaceAll('Where should Canadians', 'Where should US players')
		.replaceAll('Canadians buy', 'US players buy')
		.replaceAll('Canadian players', 'US players')
		.replaceAll('Canadian shoppers', 'US shoppers')
		.replaceAll('Canadian outdoor', 'US outdoor')
		.replaceAll('Canadian hard courts', 'US hard courts')
		.replaceAll('Canadian courts', 'US courts')
		.replaceAll('Canadian gym', 'US gym')
		.replaceAll('Canadian club', 'US club')
		.replaceAll('Canadian tournament', 'US tournament')
		.replaceAll('Canadian search', 'US search')
		.replaceAll('Canadian searches', 'US searches')
		.replaceAll('Canadian pickleball', 'US pickleball')
		.replaceAll('Canadian Pickleball', 'US Pickleball')
		.replaceAll('Canadian community', 'US community')
		.replaceAll('Canadian Gear', 'US Gear')
		.replaceAll('Canadian court', 'US court')
		.replaceAll('for Canadian ', 'for US ')
		.replaceAll('with Canadian ', 'with US ')
		.replaceAll('and Canadian ', 'and US ')
		.replaceAll('real Canadian ', 'real US ')
		.replaceAll('curated for Canadian ', 'curated for US ')
		.replaceAll('popular with Canadian ', 'popular with US ')
		.replaceAll('Built for the Canadian ', 'Built for the US ')
		.replaceAll('Built for Canadian ', 'Built for US ')
		.replaceAll(' in Canada', ' in the US')
		.replaceAll('Canada availability', 'US availability')
		.replaceAll('Canada shoppers', 'US shoppers')
		.replaceAll('on Canada', 'on the US')
		.replaceAll('Where to buy in Canada', 'Where to buy in the US')
		.replaceAll('Canadians who', 'US players who')
		.replaceAll('Canadians', 'US players')
		// Catch-all adjective after specific phrases (do not blanket-replace bare "Canada"
		// — RegionGate keeps a Canada choice label).
		.replaceAll('Canadian ', 'US ');

	// Host rewrite also rewrites hreflang hrefs — restore CA + x-default alternates.
	next = next
		.replace(
			/(<link rel="alternate" hreflang="en-CA" href=")https:\/\/(www\.)?uspickleballcourt\.com/g,
			'$1https://thepickleballcourt.ca',
		)
		.replace(
			/(<link rel="alternate" hreflang="x-default" href=")https:\/\/(www\.)?uspickleballcourt\.com/g,
			'$1https://thepickleballcourt.ca',
		);

	return next;
}

export async function onRequest(context) {
	const requestUrl = new URL(context.request.url);

	// Let /go/* redirect handlers run untouched.
	if (requestUrl.pathname.startsWith('/go/')) {
		return context.next();
	}

	// Temporary AvantLink publisher verification (remove after approval).
	// Served from the Worker so it never falls through to the HTML app shell.
	if (
		requestUrl.pathname === '/avantlink_confirmation.txt' ||
		requestUrl.pathname === '/avantlink-verify/avantlink_confirmation.txt'
	) {
		return new Response('dc9d43f54427baacc0c00206e5841dd5324fa232\n', {
			status: 200,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'no-store',
			},
		});
	}
	if (
		requestUrl.pathname === '/avantlink-verify' ||
		requestUrl.pathname === '/avantlink-verify.html'
	) {
		const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>AvantLink website verification</title>
<script type="text/javascript" src="http://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=dc9d43f54427baacc0c00206e5841dd5324fa232"></script>
</head>
<body>
<p>AvantLink verification for USPickleballCourt.com</p>
</body>
</html>
`;
		return new Response(html, {
			status: 200,
			headers: {
				'content-type': 'text/html; charset=utf-8',
				'cache-control': 'no-store',
			},
		});
	}

	// Serve AI-open robots for US even when Cloudflare Managed prepends blocks:
	// return our own body with Allow rules first for major AI crawlers.
	if (requestUrl.pathname === '/robots.txt' && shouldRewrite(requestUrl.hostname)) {
		const siteUrl = 'https://uspickleballcourt.com';
		const body = `# AI answer / grounding crawlers — allowed for GEO visibility
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Amazonbot
Allow: /

# Bulk scrapers we still block
User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

User-agent: *
Content-Signal: search=yes,ai-train=yes,ai-input=yes,use=reference
Allow: /

Sitemap: ${siteUrl}/sitemap-index.xml
Sitemap: ${siteUrl}/sitemap.xml
`;
		return new Response(body, {
			status: 200,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				// Discourage CF from injecting managed AI blocks into this response when possible.
				'cache-control': 'public, max-age=300',
				'x-robots-source': 'pages-function',
			},
		});
	}

	const response = await context.next();

	if (!shouldRewrite(requestUrl.hostname)) {
		return response;
	}

	const contentType = response.headers.get('content-type') || '';
	if (!isRewritable(contentType, requestUrl.pathname)) {
		return response;
	}

	const body = await response.text();
	const rewritten = rewriteForUs(body);
	const headers = new Headers(response.headers);
	headers.delete('content-length');

	return new Response(rewritten, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
