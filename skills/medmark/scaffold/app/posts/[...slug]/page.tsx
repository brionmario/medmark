import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import site from '@/site.config';
import {renderMarkdown} from '../../lib/markdown';
import {excerpt, formatDate, getPost, getPosts, postUrl, tagSlug, type Post} from '../../lib/posts';

interface PostPageProps {
  params: Promise<{slug: string[]}>;
}

export function generateStaticParams(): {slug: string[]}[] {
  const posts: Post[] = getPosts();

  // A static export needs at least one path per dynamic route, so a blog with
  // no posts copied in yet still builds. The page 404s on that placeholder.
  return posts.length > 0 ? posts.map((post: Post) => ({slug: post.segments})) : [{slug: ['_']}];
}

export async function generateMetadata({params}: PostPageProps): Promise<Metadata> {
  const {slug} = await params;
  const post: Post | undefined = getPost(slug);

  if (!post) {
    return {};
  }

  const description: string = excerpt(post) || site.description;

  return {
    alternates: {canonical: post.canonicalUrl || postUrl(post)},
    description,
    openGraph: {
      description,
      ...(post.date ? {publishedTime: post.date.toISOString()} : {}),
      ...(post.ogImage ? {images: [post.ogImage]} : {}),
      title: post.title,
      type: 'article',
      url: postUrl(post),
    },
    title: post.title,
  };
}

export default async function PostPage({params}: PostPageProps) {
  const {slug} = await params;
  const posts: Post[] = getPosts();
  const index: number = posts.findIndex((entry: Post) => entry.segments.join('/') === slug.join('/'));
  const post: Post | undefined = posts[index];

  if (!post) {
    notFound();
  }

  const html: string = await renderMarkdown(post.body);
  const newer: Post | undefined = posts[index - 1];
  const older: Post | undefined = posts[index + 1];

  return (
    <article className="py-12">
      <Link className="text-soft hover:text-ink text-sm transition-colors" href="/">
        ← Writing
      </Link>

      <header className="mt-8">
        <h1 className="font-serif text-[2.1rem] leading-[1.15] tracking-tight sm:text-[2.4rem]">{post.title}</h1>

        <p className="text-soft mt-4 text-sm">
          <time dateTime={post.date?.toISOString()} suppressHydrationWarning>
            {formatDate(post.date)}
          </time>
          {post.readingTime && <> · {post.readingTime}</>}
          {post.authors.length > 0 && post.authors[0] !== site.name && <> · {post.authors.join(', ')}</>}
        </p>

        {post.tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <li key={tag}>
                <Link
                  className="border-line text-soft hover:border-accent hover:text-accent rounded-full border px-2.5 py-1 text-xs transition-colors"
                  href={`/tags/${tagSlug(tag)}/`}
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      {post.bannerImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img alt="" className="border-line mt-10 w-full rounded-lg border" src={post.bannerImage} />
      )}

      {/* The HTML comes from the author's own Markdown, rendered at build time. */}
      <div className="prose mt-10" dangerouslySetInnerHTML={{__html: html}} />

      {post.canonicalUrl && (
        <p className="text-soft border-line mt-12 border-t pt-6 text-sm">
          Originally published at{' '}
          <a
            className="decoration-accent underline decoration-1 underline-offset-4"
            href={post.canonicalUrl}
            rel="noreferrer"
          >
            {post.canonicalUrl.replace(/^https?:\/\//, '').split('/')[0]}
          </a>
          .
        </p>
      )}

      {(newer || older) && (
        <nav className="border-line mt-12 grid gap-6 border-t pt-8 sm:grid-cols-2">
          {older ? (
            <Link className="group" href={postUrl(older)}>
              <span className="text-soft text-xs tracking-[0.18em] uppercase">← Older</span>
              <span className="group-hover:text-accent mt-2 block font-serif text-lg leading-snug transition-colors">
                {older.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {newer && (
            <Link className="group sm:text-right" href={postUrl(newer)}>
              <span className="text-soft text-xs tracking-[0.18em] uppercase">Newer →</span>
              <span className="group-hover:text-accent mt-2 block font-serif text-lg leading-snug transition-colors">
                {newer.title}
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
