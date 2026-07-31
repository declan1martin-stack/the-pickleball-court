/**
 * Host-based marketplace rewrite for the shared Pages project.
 *
 * - thepickleballcourt.ca → serve build as-is (Amazon.ca + thepickleb050-20)
 * - uspickleballcourt.com → rewrite product/affiliate/canonical strings to US
 *
 * Idempotent: a US-region build (PUBLIC_SITE_REGION=us) already contains US
 * strings, so these replacements are no-ops.
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
	return body
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
		.replaceAll('Amazon.ca', 'Amazon.com')
		.replaceAll('Amazon.comand', 'Amazon.com and')
		.replaceAll('>.ca</span>', '>.com</span>')
		.replaceAll('>.ca<', '>.com<')
		.replaceAll('Pickleball Court.ca', 'Pickleball Court.com')
		.replaceAll('content="en_CA"', 'content="en_US"')
		.replaceAll('lang="en-CA"', 'lang="en-US"')
		.replaceAll('"inLanguage":"en-CA"', '"inLanguage":"en-US"')
		.replaceAll('"areaServed":"CA"', '"areaServed":"US"')
		.replaceAll('"priceCurrency":"CAD"', '"priceCurrency":"USD"');
}

export async function onRequest(context) {
	const requestUrl = new URL(context.request.url);
	// Let /go/ca and /go/us redirect handlers run untouched.
	if (requestUrl.pathname.startsWith('/go/')) {
		return context.next();
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
