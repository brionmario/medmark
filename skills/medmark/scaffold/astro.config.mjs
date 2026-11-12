import {defineConfig} from 'astro/config';

export default defineConfig({
  // Set this to your public URL before deploying so that canonical links,
  // the sitemap and RSS links are absolute, e.g. 'https://blog.example.com'.
  site: process.env.SITE_URL,
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
