/**
 * Slim Cloudflare Pages middleware for the US-primary build.
 *
 * CA→US consolidation is handled by a zone-level Redirect Rule on
 * thepickleballcourt.ca — this function does NOT rewrite HTML bodies.
 *
 * Responsibilities:
 * - www → apex 301
 * - Google Search Console HTML verification stubs
 * - Temporary AvantLink publisher verification files
 * - /robots.txt served from the Function so Managed AI blocks cannot prepend Disallow
 */

const APEX_HOST = 'uspickleballcourt.com';
const SITE_URL = `https://${APEX_HOST}`;

export async function onRequest(context) {
	const requestUrl = new URL(context.request.url);
	const host = (requestUrl.hostname || '').toLowerCase();

	// Canonical host: apex only (www duplicates dilute crawl signals).
	if (host === 'www.uspickleballcourt.com' || host === 'www.thepickleballcourt.ca') {
		const apex =
			host === 'www.thepickleballcourt.ca'
				? 'https://thepickleballcourt.ca'
				: SITE_URL;
		return Response.redirect(`${apex}${requestUrl.pathname}${requestUrl.search}`, 301);
	}

	// GSC HTML-file verification must stay on the exact `.html` URL (no 308 strip).
	const gscFile = requestUrl.pathname.match(/^\/(google[a-z0-9]+)\.html$/i);
	if (gscFile) {
		return new Response(`google-site-verification: ${gscFile[1].toLowerCase()}.html\n`, {
			status: 200,
			headers: {
				'content-type': 'text/html; charset=utf-8',
				'cache-control': 'public, max-age=300',
			},
		});
	}

	// Let /go/* redirect handlers run untouched.
	if (requestUrl.pathname.startsWith('/go/')) {
		return context.next();
	}

	// Temporary AvantLink publisher verification (remove after approval).
	if (
		requestUrl.pathname === '/avantlink_confirmation.txt' ||
		requestUrl.pathname === '/avantlink-verify/avantlink_confirmation.txt'
	) {
		const confirmation = `<?xml version="1.0" encoding="UTF-8" ?>
<root>
	<Process>Application-Confirmation</Process>
	<Version>1.0</Version>
	<Mode>Verify-File</Mode>
	<Authentication>dc9d43f54427baacc0c00206e5841dd5324fa232</Authentication>
</root>`;
		return new Response(confirmation, {
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

	// Serve robots.txt from the Function so Cloudflare Managed AI blocks cannot prepend Disallow.
	if (requestUrl.pathname === '/robots.txt') {
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
Allow: /

Sitemap: ${SITE_URL}/sitemap-index.xml
`;
		return new Response(body, {
			status: 200,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'public, max-age=300',
				'x-robots-source': 'pages-function',
			},
		});
	}

	return context.next();
}
