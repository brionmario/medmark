import Link from 'next/link';
import {excerpt, formatDate, groupByYear, postUrl, type Post} from '../lib/posts';

/** The reading list: posts grouped by year, newest first. */
export default function PostList({posts}: {posts: Post[]}) {
  const years: [string, Post[]][] = groupByYear(posts);

  return (
    <div className="space-y-12">
      {years.map(([year, yearPosts]: [string, Post[]]) => (
        <section key={year}>
          <h2 className="text-soft mb-1 text-xs font-medium tracking-[0.18em] uppercase">{year}</h2>

          <ul>
            {yearPosts.map((post: Post) => {
              const summary: string = excerpt(post);

              return (
                <li className="border-line border-t" key={post.segments.join('/')}>
                  <Link className="group block py-5" href={postUrl(post)}>
                    <div className="flex flex-col-reverse gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5">
                      <h3 className="group-hover:text-accent font-serif text-[1.3rem] leading-snug tracking-tight transition-colors">
                        {post.title}
                        {post.draft && (
                          <span className="text-soft border-line ml-2 rounded-full border px-2 py-0.5 align-middle text-[0.625rem] font-sans tracking-wide uppercase">
                            Draft
                          </span>
                        )}
                      </h3>
                      <time
                        className="text-soft text-xs tabular-nums sm:shrink-0"
                        dateTime={post.date?.toISOString()}
                        suppressHydrationWarning
                      >
                        {formatDate(post.date)}
                      </time>
                    </div>

                    {summary && <p className="text-soft mt-2 text-sm leading-relaxed">{summary}</p>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
