import type {Metadata} from 'next';
import site, {type SiteLink} from '@/site.config';
import PostList from './components/post-list';
import {getPosts, type Post} from './lib/posts';

export const metadata: Metadata = {alternates: {canonical: '/'}};

export default function Home() {
  const posts: Post[] = getPosts();
  const intro: string = site.about[0] ?? '';

  return (
    <>
      <section className="border-line border-b py-14">
        {site.avatar && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt={site.name}
            className="border-line mb-7 h-16 w-16 rounded-full border object-cover"
            height={64}
            src={site.avatar}
            width={64}
          />
        )}

        <h1 className="font-serif text-[2.1rem] leading-[1.15] tracking-tight sm:text-[2.5rem]">{site.tagline}</h1>

        {(site.role || site.location) && (
          <p className="text-soft mt-4 text-sm">{[site.role, site.location].filter(Boolean).join(' · ')}</p>
        )}

        {intro && <p className="text-soft mt-5 max-w-[34rem] leading-relaxed">{intro}</p>}

        {site.links.length > 0 && (
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {site.links.map((link: SiteLink) => (
              <li key={link.href}>
                <a
                  className="decoration-accent hover:text-accent underline decoration-1 underline-offset-4 transition-colors"
                  href={link.href}
                  rel={link.href.startsWith('http') ? 'me noreferrer' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="pt-12">
        {posts.length === 0 ? (
          <p className="text-soft text-sm">
            No posts yet. Copy the generated Markdown into <code className="font-mono">content/posts/</code> and reload.
          </p>
        ) : (
          <PostList posts={posts} />
        )}
      </div>
    </>
  );
}
