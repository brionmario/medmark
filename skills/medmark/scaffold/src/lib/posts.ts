import {getCollection, type CollectionEntry} from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * Returns the author names of a post, regardless of whether the template wrote
 * them as plain strings or as `{name, ...}` objects.
 */
export function authorNames(post: Post): string[] {
  return (post.data.authors ?? [])
    .map((author: unknown) => (typeof author === 'string' ? author : (author as {name?: string})?.name))
    .filter((name: string | undefined): name is string => Boolean(name));
}

/**
 * Formats a post date for display. Returns an empty string when the post has
 * no date in its front matter.
 */
export function formatDate(date: Date | undefined): string {
  if (!date) {
    return '';
  }

  return date.toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
}

/**
 * All publishable posts, newest first. Drafts are hidden in production builds
 * and shown while running `npm run dev`.
 */
export async function getPosts(): Promise<Post[]> {
  const posts: Post[] = await getCollection('posts', ({data}: Post) => import.meta.env.DEV || !data.draft);

  return posts.sort((a: Post, b: Post) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0));
}
