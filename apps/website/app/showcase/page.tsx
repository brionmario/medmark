import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Code2, Plus } from 'lucide-react';
import { gitConfig } from '@/lib/shared';
import { getDisplayHost, getShowcaseSites, type ShowcaseSite } from '@/lib/showcase';

const submitUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/edit/${gitConfig.branch}/apps/website/content/showcase.json`;

export const metadata: Metadata = {
  title: 'Showcase',
  description: 'Blogs and sites whose content was migrated from Medium with medmark.',
};

function SiteCard({ site }: { site: ShowcaseSite }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/40">
      <div className="flex items-start justify-between gap-3">
        <a
          href={site.url}
          target="_blank"
          rel="noreferrer noopener"
          className="group inline-flex items-center gap-1.5 font-semibold text-fd-foreground no-underline"
        >
          {site.name}
          <ArrowUpRight className="size-3.5 shrink-0 text-fd-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        {site.repo && (
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${site.name} source code`}
            className="shrink-0 text-fd-muted-foreground hover:text-fd-foreground"
          >
            <Code2 className="size-4" />
          </a>
        )}
      </div>

      <p className="m-0 text-sm text-fd-muted-foreground">{site.description}</p>

      {site.tags && site.tags.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {site.tags.map(tag => (
            <li
              key={tag}
              className="rounded-md border border-fd-border px-1.5 py-0.5 text-[0.7rem] text-fd-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-1 text-xs text-fd-muted-foreground">
        <span className="truncate">{getDisplayHost(site.url)}</span>
        <span className="shrink-0">
          {site.author.github ? (
            <a
              href={`https://github.com/${site.author.github}`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-fd-muted-foreground hover:text-fd-foreground"
            >
              @{site.author.github}
            </a>
          ) : (
            site.author.name
          )}
        </span>
      </div>
    </div>
  );
}

function SubmitCard() {
  return (
    <a
      href={submitUrl}
      target="_blank"
      rel="noreferrer noopener"
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-fd-border p-5 text-center no-underline transition-colors hover:border-fd-primary/50 hover:bg-fd-accent/40"
    >
      <Plus className="size-5 text-fd-muted-foreground" />
      <span className="font-semibold text-fd-foreground">Add your site</span>
      <span className="text-sm text-fd-muted-foreground">
        Edit <code className="text-xs">showcase.json</code> and open a pull request.
      </span>
    </a>
  );
}

export default function Page() {
  const sites = getShowcaseSites();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <header className="mb-10 flex flex-col gap-3">
        <h1 className="m-0 text-3xl font-bold tracking-tight sm:text-4xl">Showcase</h1>
        <p className="m-0 max-w-2xl text-fd-muted-foreground">
          Blogs and sites whose content was migrated off Medium with medmark. Moved your own writing
          across? Add it to the list — it is a one-line change to a JSON file.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href={submitUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-3.5 py-2 text-sm font-medium text-fd-primary-foreground no-underline hover:opacity-90"
          >
            <Plus className="size-4" />
            Submit your site
          </a>
          <Link
            href="/docs/showcase"
            className="text-sm text-fd-muted-foreground no-underline hover:text-fd-foreground"
          >
            Submission guide →
          </Link>
        </div>
      </header>

      {sites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-fd-border p-10 text-center">
          <p className="m-0 font-semibold text-fd-foreground">Nothing here yet</p>
          <p className="m-0 mt-1 text-sm text-fd-muted-foreground">
            Be the first — see the{' '}
            <Link href="/docs/showcase" className="underline">
              submission guide
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map(site => (
            <SiteCard key={site.url} site={site} />
          ))}
          <SubmitCard />
        </div>
      )}
    </main>
  );
}
