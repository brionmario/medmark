import type {APIRoute} from 'astro';
import {getPosts, type Post} from '../lib/posts';
import site from '../site.json';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const GET: APIRoute = async ({site: astroSite}) => {
  const base: string = (astroSite?.href ?? '/').replace(/\/+$/, '');
  const posts: Post[] = await getPosts();

  const items: string = posts
    .map((post: Post) => {
      const link: string = `${base}/posts/${post.id}/`;

      return [
        '    <item>',
        `      <title>${escapeXml(post.data.title ?? post.id)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid>${escapeXml(link)}</guid>`,
        post.data.description ? `      <description>${escapeXml(post.data.description)}</description>` : '',
        post.data.date ? `      <pubDate>${post.data.date.toUTCString()}</pubDate>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml: string = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${escapeXml(base || '/')}</link>
    <description>${escapeXml(site.description)}</description>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {headers: {'Content-Type': 'application/xml'}});
};
