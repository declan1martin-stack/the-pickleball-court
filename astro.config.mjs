// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

const region = (process.env.PUBLIC_SITE_REGION ?? 'us').toString().trim().toLowerCase();
const site =
	process.env.PUBLIC_SITE_URL?.trim() ||
	(region === 'ca' ? 'https://thepickleballcourt.ca' : 'https://uspickleballcourt.com');

// https://astro.build/config
// trailingSlash: 'never' + build.format: 'file' keep sitemap, canonicals, and Cloudflare Pages
// hosting aligned (directory/index.html builds otherwise force a trailing slash on CF Pages).
export default defineConfig({
  site,
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'images-amazon.com' },
    ],
  },
  integrations: [
    sitemap({
      // Prefer real content dates when present; do not stamp every URL with deploy time.
      filter: (page) => !page.endsWith('/404') && !page.includes('/404'),
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});