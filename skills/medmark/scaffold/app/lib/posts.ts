import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR: string = path.join(process.cwd(), 'content', 'posts');

export interface PostMeta {
  /** URL path segments, e.g. `['my-post']`. */
  segments: string[];
  /** `my-post`, the folder name medmark generated. */
  slug: string;
  title: string;
  date: Date | null;
  description: string;
  readingTime: string;
  draft: boolean;
  tags: string[];
  authors: string[];
  bannerImage: string;
  ogImage: string;
  /** Set this in front matter if the Medium original stays online. */
  canonicalUrl: string;
}

export interface Post extends PostMeta {
  /** The Markdown body, without front matter. */
  body: string;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return asString(value) ? [asString(value)] : [];
  }

  return value
    .map((item: unknown) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      // medmark writes authors as `{name: '...'}`.
      return asString((item as {name?: unknown} | null)?.name);
    })
    .filter(Boolean);
}

function asDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/** medmark usually supplies `readingTime`; this is the fallback. */
function estimateReadingTime(body: string): string {
  const words: number = body.split(/\s+/).filter(Boolean).length;

  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/**
 * Every Markdown file under `content/posts`, as `[relative path, slug segments]`.
 *
 * medmark writes one folder per post containing `index.md`, but a loose
 * `my-post.md` works too, as does a nested folder.
 */
function findPostFiles(dir: string, segments: string[] = []): [string, string[]][] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const found: [string, string[]][] = [];

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const full: string = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // `resources` folders hold images for LOCAL image posts, not posts.
      if (entry.name === 'resources') {
        continue;
      }

      found.push(...findPostFiles(full, [...segments, entry.name]));
      continue;
    }

    if (!/\.mdx?$/.test(entry.name)) {
      continue;
    }

    const base: string = entry.name.replace(/\.mdx?$/, '');

    found.push([full, base === 'index' ? segments : [...segments, base]]);
  }

  return found;
}

function readPost(file: string, segments: string[]): Post | null {
  if (segments.length === 0) {
    return null;
  }

  const parsed = matter(fs.readFileSync(file, 'utf8'));
  const data = parsed.data as Record<string, unknown>;
  const slug: string = segments[segments.length - 1]!;

  return {
    authors: asStringArray(data.authors),
    bannerImage: asString(data.bannerImage),
    body: parsed.content,
    canonicalUrl: asString(data.canonicalUrl) || asString(data.canonical),
    date: asDate(data.date),
    description: asString(data.description),
    draft: data.draft === true,
    ogImage: asString(data.ogImage) || asString(data.bannerImage),
    readingTime: asString(data.readingTime) || estimateReadingTime(parsed.content),
    segments,
    slug,
    tags: asStringArray(data.tags),
    title: asString(data.title) || slug.replace(/-/g, ' '),
  };
}

/**
 * All posts, newest first. Drafts are visible while running `npm run dev` and
 * dropped from production builds.
 */
export function getPosts(): Post[] {
  const showDrafts: boolean = process.env.NODE_ENV !== 'production';

  return findPostFiles(POSTS_DIR)
    .map(([file, segments]: [string, string[]]) => readPost(file, segments))
    .filter((post: Post | null): post is Post => Boolean(post) && (showDrafts || !post!.draft))
    .sort((a: Post, b: Post) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
}

export function getPost(segments: string[]): Post | undefined {
  return getPosts().find((post: Post) => post.segments.join('/') === segments.join('/'));
}

/** The site-relative URL of a post. */
export function postUrl(post: PostMeta): string {
  return `/posts/${post.segments.join('/')}/`;
}

export function formatDate(date: Date | null): string {
  if (!date) {
    return '';
  }

  return date.toLocaleDateString('en-US', {day: 'numeric', month: 'long', timeZone: 'UTC', year: 'numeric'});
}

/** Posts grouped by year, newest year first. */
export function groupByYear(posts: Post[]): [string, Post[]][] {
  const groups = new Map<string, Post[]>();

  for (const post of posts) {
    const year: string = post.date ? String(post.date.getUTCFullYear()) : 'Undated';

    groups.set(year, [...(groups.get(year) ?? []), post]);
  }

  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Every tag used by a published post, with its posts, most used first. */
export function getTags(posts: Post[] = getPosts()): {count: number; posts: Post[]; slug: string; tag: string}[] {
  const bySlug = new Map<string, {posts: Post[]; tag: string}>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const slug: string = tagSlug(tag);

      if (!slug) {
        continue;
      }

      const existing = bySlug.get(slug);

      if (existing) {
        existing.posts.push(post);
      } else {
        bySlug.set(slug, {posts: [post], tag});
      }
    }
  }

  return [...bySlug.entries()]
    .map(([slug, {posts: tagPosts, tag}]) => ({count: tagPosts.length, posts: tagPosts, slug, tag}))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
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
 * Medium usually repeats the title (sometimes twice). This strips those leading
 * repetitions and trims the rest, so the list reads like a blog instead of a
 * dump of the first paragraph.
 */
export function excerpt(post: PostMeta): string {
  let text: string = post.description.replace(/\s+/g, ' ').trim();
  const normalisedTitle: string = normalise(post.title);
  const titleLength: number = normalisedTitle.replace(/ /g, '').length;

  for (let i = 0; i < 2 && titleLength > 0; i++) {
    if (!normalise(text).startsWith(normalisedTitle)) {
      break;
    }

    // Walk forward through the raw text until as many word characters as the
    // title have been consumed, so punctuation and casing don't matter.
    let seen = 0;
    let cut = 0;

    while (cut < text.length && seen < titleLength) {
      if (/[a-z0-9]/i.test(text[cut]!)) {
        seen++;
      }
      cut++;
    }

    const rest: string = text.slice(cut).replace(/^[\s.:|—–-]+/, '');

    // Only a repetition if a new sentence follows. "Shipping a design system is
    // mostly a people problem" is the title *inside* the sentence, and cutting
    // it would leave the excerpt starting mid-clause.
    if (!rest || /^[a-z]/.test(rest)) {
      break;
    }

    text = rest;
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
