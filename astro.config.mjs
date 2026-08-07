// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

const region = (process.env.PUBLIC_SITE_REGION ?? 'ca').toString().trim().toLowerCase();
const site =
	process.env.PUBLIC_SITE_URL?.trim() ||
	(region === 'us' ? 'https://uspickleballcourt.com' : 'https://thepickleballcourt.ca');

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    sitemap({
      // Fresh lastmod on every deploy — helps crawlers prioritize re-crawl after content drops.
      serialize(item) {
        return {
          ...item,
          lastmod: new Date(),
        };
      },
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});