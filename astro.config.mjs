// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gweinger.com',
  output: 'static',
  integrations: [
    sitemap({
      // Keep noindexed pages out of the sitemap: the gated watch page and
      // the unlinked Introvert Army section. (/labs was retired 2026-09-07 —
      // it no longer builds, it 301s from public/_redirects.)
      filter: (page) =>
        !page.includes('/masterclass/watch') &&
        !page.includes('/introvert-army'),
    }),
  ],
});
