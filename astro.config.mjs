// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

// Single indexable host. PUBLIC_SITE_REGION=ca is accepted by `build:ca` but ignored.
const site = process.env.PUBLIC_SITE_URL?.trim() || 'https://uspickleballcourt.com';
const siteRegion = (process.env.PUBLIC_SITE_REGION || 'us').trim().toLowerCase();
const isUsBuild = siteRegion === 'us';

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
      // Legacy /news/ca-* pages still build (retired thepickleballcourt.ca 301s land on 200s)
      // but they are noindex and must not consume US sitemap crawl budget.
      filter: (page) => {
        if (page.endsWith('/404') || page.includes('/404')) return false;
        if (!isUsBuild) return true;
        try {
          return !new URL(page).pathname.startsWith('/news/ca-');
        } catch {
          return !page.includes('/news/ca-');
        }
      },
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});