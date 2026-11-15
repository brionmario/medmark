import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import site from '@/site.config';
import PostList from '../../components/post-list';
import {getTags, type Post} from '../../lib/posts';

interface TagPageProps {
  params: Promise<{tag: string}>;
}

export function generateStaticParams(): {tag: string}[] {
  const tags = getTags();

  // See the note in app/posts/[...slug]/page.tsx — one placeholder path keeps
  // `next build` working before any posts exist.
  return tags.length > 0 ? tags.map(({slug}: {slug: string}) => ({tag: slug})) : [{tag: '_'}];
}

export async function generateMetadata({params}: TagPageProps): Promise<Metadata> {
  const {tag} = await params;
  const match = getTags().find((entry: {slug: string}) => entry.slug === tag);

  if (!match) {
    return {};
  }

  return {
    alternates: {canonical: `/tags/${match.slug}/`},
    description: `Posts about ${match.tag} by ${site.name}.`,
    title: match.tag,
  };
}

export default async function TagPage({params}: TagPageProps) {
  const {tag} = await params;
  const match = getTags().find((entry: {slug: string}) => entry.slug === tag);

  if (!match) {
    notFound();
  }

  const posts: Post[] = match.posts;

  return (
    <section className="py-12">
      <Link className="text-soft hover:text-ink text-sm transition-colors" href="/">
        ← Writing
      </Link>

      <h1 className="mt-8 font-serif text-[2rem] leading-tight tracking-tight">{match.tag}</h1>
      <p className="text-soft mt-3 text-sm">
        {posts.length} {posts.length === 1 ? 'post' : 'posts'}
      </p>

      <div className="mt-12">
        <PostList posts={posts} />
      </div>
    </section>
  );
}
