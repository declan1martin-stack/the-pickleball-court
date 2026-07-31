/**
 * Geography handoff: /go/ca?next=/path → thepickleballcourt.ca
 *                   /go/us?next=/path → uspickleballcourt.com
 *
 * Relative /go/* links avoid host rewrites in _middleware.js.
 */

const DESTINATIONS = {
	ca: 'https://thepickleballcourt.ca',
	us: 'https://uspickleballcourt.com',
};

function safeNextPath(raw) {
	if (!raw || typeof raw !== 'string') return '/';
	let path = raw.trim();
	try {
		if (/^https?:\/\//i.test(path)) {
			path = new URL(path).pathname + new URL(path).search;
		}
	} catch {
		return '/';
	}
	if (!path.startsWith('/') || path.startsWith('//')) return '/';
	return path;
}

export async function onRequest(context) {
	const url = new URL(context.request.url);
	const region = (context.params.region || '').toLowerCase();
	const destination = DESTINATIONS[region];
	if (!destination) {
		return new Response('Unknown region', { status: 404 });
	}

	const next = safeNextPath(url.searchParams.get('next'));
	return Response.redirect(`${destination}${next}`, 302);
}
