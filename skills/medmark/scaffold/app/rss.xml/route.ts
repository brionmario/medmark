import site, {siteUrl} from '@/site.config';
import {excerpt, getPosts, postUrl, type Post} from '../lib/posts';

export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * The RSS feed. Absolute links need the public URL, so set `url` in
 * site.config.ts (or SITE_URL in the build environment) before deploying.
 */
export function GET(): Response {
  const base: string = siteUrl;
  const posts: Post[] = getPosts();

  const items: string = posts
    .map((post: Post) => {
      const link: string = `${base}${postUrl(post)}`;
      const summary: string = excerpt(post);

      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        summary ? `      <description>${escapeXml(summary)}</description>` : '',
        post.date ? `      <pubDate>${post.date.toUTCString()}</pubDate>` : '',
        ...post.tags.map((tag: string) => `      <category>${escapeXml(tag)}</category>`),
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(base || '/')}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {headers: {'Content-Type': 'application/xml; charset=utf-8'}});
}
