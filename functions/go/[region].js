/**
 * Legacy geography handoff. Both regions now land on the US host.
 * /go/ca and /go/us used to send shoppers to separate domains.
 */

const DESTINATION = 'https://uspickleballcourt.com';

function safeNextPath(raw) {
	if (!raw || typeof raw !== 'string') return '/';
	let path = raw.trim();
	try {
		if (/^https?:\/\//i.test(path)) {
			const parsed = new URL(path);
			path = parsed.pathname + parsed.search;
		}
	} catch {
		return '/';
	}
	if (!path.startsWith('/') || path.startsWith('//')) return '/';
	if (path.length > 1) path = path.replace(/\/+$/, '') || '/';
	return path;
}

export async function onRequest(context) {
	const url = new URL(context.request.url);
	const region = (context.params.region || '').toLowerCase();
	if (region !== 'us' && region !== 'ca') {
		return new Response('Unknown region', { status: 404 });
	}

	const next = safeNextPath(url.searchParams.get('next'));
	return Response.redirect(`${DESTINATION}${next === '/' ? '' : next}`, 301);
}
