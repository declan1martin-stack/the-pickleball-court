/**
 * Slim Cloudflare Pages middleware for dual-region deploys.
 *
 * Each host is built separately (`build:ca` / `build:us`). This function does
 * NOT rewrite HTML bodies.
 *
 * Responsibilities:
 * - www → apex 301
 * - Google Search Console HTML verification stubs
 * - Temporary AvantLink publisher verification files
 * - Market-only news 404s on the wrong host (stale edge / wrong build)
 * - /robots.txt served from the Function so Managed AI blocks cannot prepend Disallow
 */

const HOSTS = {
	us: {
		apex: 'uspickleballcourt.com',
		www: 'www.uspickleballcourt.com',
		siteUrl: 'https://uspickleballcourt.com',
	},
	ca: {
		apex: 'thepickleballcourt.ca',
		www: 'www.thepickleballcourt.ca',
		siteUrl: 'https://thepickleballcourt.ca',
	},
};

/** News built only for the opposite market — keep off this host's index. */
const CA_ONLY_NEWS = new Set([
	'/news/ca-roundup-cnpl-central-split-august-2026',
	'/news/ca-roundup-cnpl-nationals-ppa-canada-august-2026',
	'/news/ca-results-cnpl-central-split-armaan-jiwa-mawji-august-2026',
]);

const US_ONLY_NEWS = new Set([
	'/news/us-roundup-mlp-playoffs-ppa-august-2026',
	'/news/us-roundup-world-rankings-mlp-playoffs-august-2026',
	'/news/us-results-mlp-dallas-playoffs-cailyn-campbell-august-2026',
	'/news/us-feature-mlp-franchise-valuations-teams-august-2026',
]);

function resolveHost(hostname) {
	const host = (hostname || '').toLowerCase();
	if (host === HOSTS.us.apex || host === HOSTS.us.www) return { region: 'us', ...HOSTS.us, host };
	if (host === HOSTS.ca.apex || host === HOSTS.ca.www) return { region: 'ca', ...HOSTS.ca, host };
	return null;
}

export async function onRequest(context) {
	const requestUrl = new URL(context.request.url);
	const resolved = resolveHost(requestUrl.hostname);

	// Canonical host: apex only (www duplicates dilute crawl signals).
	if (resolved && resolved.host === resolved.www) {
		return Response.redirect(`${resolved.siteUrl}${requestUrl.pathname}${requestUrl.search}`, 301);
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

	const barePath = requestUrl.pathname.replace(/\/+$/, '') || '/';
	const pathNoHtml = barePath.replace(/\.html$/i, '');
	if (resolved?.region === 'us') {
		if (CA_ONLY_NEWS.has(barePath) || CA_ONLY_NEWS.has(pathNoHtml)) {
			return new Response('Not Found', {
				status: 404,
				headers: {
					'content-type': 'text/plain; charset=utf-8',
					'cache-control': 'no-store',
					'x-robots-tag': 'noindex',
				},
			});
		}
	}
	if (resolved?.region === 'ca') {
		if (US_ONLY_NEWS.has(barePath) || US_ONLY_NEWS.has(pathNoHtml)) {
			return new Response('Not Found', {
				status: 404,
				headers: {
					'content-type': 'text/plain; charset=utf-8',
					'cache-control': 'no-store',
					'x-robots-tag': 'noindex',
				},
			});
		}
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
		const siteUrl = resolved?.siteUrl || HOSTS.us.siteUrl;
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

Sitemap: ${siteUrl}/sitemap-index.xml
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
