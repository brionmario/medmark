import type {MetadataRoute} from 'next';
import site, {siteUrl} from '@/site.config';
import {getPosts, getTags, postUrl, type Post} from './lib/posts';

/** Falls back to localhost so a build without a public URL still succeeds. */
const base: string = siteUrl || 'http://localhost:3000';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts: Post[] = getPosts();

  return [
    {changeFrequency: 'weekly', priority: 1, url: `${base}/`},
    ...(site.about.length > 0 ? [{changeFrequency: 'yearly' as const, priority: 0.5, url: `${base}/about/`}] : []),
    ...posts.map((post: Post) => ({
      ...(post.date ? {lastModified: post.date} : {}),
      priority: 0.8,
      url: `${base}${postUrl(post)}`,
    })),
    ...getTags(posts).map(({slug}: {slug: string}) => ({priority: 0.3, url: `${base}/tags/${slug}/`})),
  ];
}
