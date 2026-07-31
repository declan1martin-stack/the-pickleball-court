import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/site';

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
Sitemap: ${SITE_URL}/sitemap.xml
`;

export const GET: APIRoute = () =>
	new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
