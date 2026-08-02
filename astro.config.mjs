// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gweinger.com',
  output: 'static',
  integrations: [
    sitemap({
      // Keep noindexed pages out of the sitemap: gated/thank-you pages and
      // the unlinked Introvert Army section.
      filter: (page) =>
        !page.includes('/masterclass/watch') &&
        !page.includes('/labs/thank-you') &&
        !page.includes('/introvert-army'),
    }),
  ],
});
