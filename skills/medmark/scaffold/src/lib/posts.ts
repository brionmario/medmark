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

const MAX_EXCERPT = 180;

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * A readable summary for a post card.
 *
 * medmark builds `description` from the opening of the post body, which on
 * Medium usually repeats the title (sometimes twice). This strips those
 * leading repetitions and trims the rest to a sentence or two, so the cards
 * read like a blog instead of a dump of the first paragraph.
 */
export function excerpt(post: Post): string {
  const title: string = post.data.title ?? '';
  let text: string = (post.data.description ?? '').replace(/\s+/g, ' ').trim();

  // medmark's description is the opening of the body, which Medium posts often
  // start with the title itself — sometimes twice.
  if (title) {
    const normalisedTitle: string = normalise(title);
    const titleLength: number = normalisedTitle.replace(/ /g, '').length;

    for (let i = 0; i < 2 && titleLength > 0; i++) {
      if (!normalise(text).startsWith(normalisedTitle)) {
        break;
      }

      // Walk forward through the raw text until as many word characters as
      // the title have been consumed, so punctuation and casing don't matter.
      let seen = 0;
      let cut = 0;

      while (cut < text.length && seen < titleLength) {
        if (/[a-z0-9]/i.test(text[cut]!)) {
          seen++;
        }
        cut++;
      }

      const rest: string = text.slice(cut).replace(/^[\s.:|—–-]+/, '');

      // Only a repetition if a new sentence follows. "Shipping a design system
      // is mostly a people problem" is the title *in* the sentence, and cutting
      // it would leave the excerpt starting mid-clause.
      if (!rest || /^[a-z]/.test(rest)) {
        break;
      }

      text = rest;
    }
  }

  // medmark ends the description with an ellipsis where it cut the body.
  const continues: boolean = /(\.{3}|…)\s*$/.test(text);
  text = text.replace(/\s*(\.{3}|…)\s*$/, '');

  if (text.length <= MAX_EXCERPT) {
    return continues ? `${text}…` : text;
  }

  const clipped: string = text.slice(0, MAX_EXCERPT);
  const lastSpace: number = clipped.lastIndexOf(' ');

  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : MAX_EXCERPT).replace(/[,;:\s]+$/, '')}…`;
}

/** The site-relative URL of a post. */
export function postUrl(post: Post): string {
  return `/posts/${post.id}/`;
}

/**
 * All publishable posts, newest first. Drafts are hidden in production builds
 * and shown while running `npm run dev`.
 */
export async function getPosts(): Promise<Post[]> {
  const posts: Post[] = await getCollection('posts', ({data}: Post) => import.meta.env.DEV || !data.draft);

  return posts.sort((a: Post, b: Post) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0));
}

/** Posts grouped by year, newest year first — handy for an archive listing. */
export function groupByYear(posts: Post[]): [string, Post[]][] {
  const groups = new Map<string, Post[]>();

  for (const post of posts) {
    const year: string = post.data.date ? String(post.data.date.getUTCFullYear()) : 'Undated';
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }

  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}
