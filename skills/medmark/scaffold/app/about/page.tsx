import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import site, {type SiteLink, type WorkEntry} from '@/site.config';

export const metadata: Metadata = {
  alternates: {canonical: '/about/'},
  description: site.about[0] ?? site.description,
  title: 'About',
};

export default function About() {
  // Nothing written yet — don't ship an empty page.
  if (site.about.length === 0) {
    notFound();
  }

  return (
    <article className="py-14">
      <h1 className="font-serif text-[2rem] leading-tight tracking-tight">About</h1>

      <div className="prose mt-8">
        {site.about.map((paragraph: string) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      {site.now && (
        <section className="border-line mt-12 border-t pt-8">
          <h2 className="text-soft mb-3 text-xs font-medium tracking-[0.18em] uppercase">Now</h2>
          <p className="leading-relaxed">{site.now}</p>
        </section>
      )}

      {site.work.length > 0 && (
        <section className="border-line mt-12 border-t pt-8">
          <h2 className="text-soft mb-5 text-xs font-medium tracking-[0.18em] uppercase">Work</h2>
          <ul className="space-y-5">
            {site.work.map((entry: WorkEntry) => (
              <li key={`${entry.company}-${entry.period}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-medium">
                    {entry.role}
                    <span className="text-soft font-normal"> · {entry.company}</span>
                  </h3>
                  <span className="text-soft shrink-0 text-xs tabular-nums">{entry.period}</span>
                </div>
                {entry.summary && <p className="text-soft mt-1 text-sm leading-relaxed">{entry.summary}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {site.links.length > 0 && (
        <section className="border-line mt-12 border-t pt-8">
          <h2 className="text-soft mb-3 text-xs font-medium tracking-[0.18em] uppercase">Elsewhere</h2>
          <ul className="space-y-2 text-sm">
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
        </section>
      )}
    </article>
  );
}
