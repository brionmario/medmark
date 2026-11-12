import type {APIRoute} from 'astro';
import {getPosts, postUrl, type Post} from '../lib/posts';

/**
 * A sitemap of the home page and every published post. Needs `site` to be set
 * in astro.config.mjs (or SITE_URL in the environment) to emit absolute URLs.
 */
export const GET: APIRoute = async ({site}) => {
  const base: string = (site?.href ?? '/').replace(/\/+$/, '');
  const posts: Post[] = await getPosts();

  const urls: string = [
    `  <url><loc>${base}/</loc></url>`,
    ...posts.map((post: Post) => {
      const lastmod: string = post.data.date ? `<lastmod>${post.data.date.toISOString().slice(0, 10)}</lastmod>` : '';

      return `  <url><loc>${base}${postUrl(post)}</loc>${lastmod}</url>`;
    }),
  ].join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    {headers: {'Content-Type': 'application/xml'}},
  );
};
