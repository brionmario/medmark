import type {Metadata} from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  FileCode2,
  GitBranch,
  Images,
  Layers,
  Rss,
  Sparkles,
  Terminal as TerminalIcon,
} from 'lucide-react';
import {CopyButton} from '@/components/copy-button';
import {MedmarkLogo} from '@/components/logo';

export const metadata: Metadata = {
  description:
    'medmark converts your Medium export into clean Markdown or MDX — front matter, images, a content registry, and an agent skill that hosts the result.',
};

const FEATURES = [
  {
    body: 'YAML front matter with slug, title, date, description, reading time, tags, categories and images — ready for any static-site generator.',
    icon: FileCode2,
    title: 'Clean Markdown & MDX',
  },
  {
    body: 'Keep Medium’s CDN URLs or download every image next to its post. Gists and embedded tweets are inlined, not lost.',
    icon: Images,
    title: 'Images and embeds handled',
  },
  {
    body: 'A registry.json or registry.ts manifest of every post, plus an RSS feed and a sitemap generated from the same data.',
    icon: Rss,
    title: 'Content registry',
  },
  {
    body: 'Own the output shape. A template is a small JS module — change the front matter, the body, the file layout, the registry.',
    icon: Layers,
    title: 'Custom templates',
  },
  {
    body: 'One interactive command, or every answer as a flag for CI. Reply posts are skipped; drafts come across when you ask for them.',
    icon: TerminalIcon,
    title: 'CLI first',
  },
  {
    body: 'Markdown in your own repository, under your own domain. No platform, no paywall, no lock-in.',
    icon: GitBranch,
    title: 'Your content, your repo',
  },
];

const STEPS = [
  {
    body: 'Medium Settings → Download your information. Unzip it into medmark/medium-export/.',
    code: 'npx medmark init',
    title: 'Export from Medium',
  },
  {
    body: 'Point medmark at the posts folder. It writes one folder per slug, each with an index.md.',
    code: 'npx medmark',
    title: 'Convert',
  },
  {
    body: 'Drop the Markdown into your site — or let the agent skill scaffold and deploy one for you.',
    code: 'npx skills add brionmario/medmark',
    title: 'Publish',
  },
];

function TerminalMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-xl shadow-black/5 dark:shadow-black/40">
      <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 font-mono text-xs text-fd-muted-foreground">medmark — zsh</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[0.8rem] leading-6 text-fd-muted-foreground">
        <code>
          <span className="text-fd-primary">$</span> <span className="text-fd-foreground">npx medmark</span>
          {'\n\n'}
          <span className="text-fd-foreground">medmark</span> · Medium → Markdown
          {'\n\n'}? Path to posts folder <span className="text-fd-primary">› medmark/medium-export/posts</span>
          {'\n'}? Output destination{'   '}
          <span className="text-fd-primary">› medmark/output</span>
          {'\n'}? Export drafts?{'       '}
          <span className="text-fd-primary">› No</span>
          {'\n\n'}
          <span className="text-fd-primary">✓</span> Found 42 articles
          {'\n'}
          <span className="text-fd-primary">✓</span> Converting{'    '}████████████████ 42/42
          {'\n'}
          <span className="text-fd-primary">✓</span> Downloading{'   '}████████████████ 36/36
          {'\n'}
          <span className="text-fd-primary">✓</span> Wrote registry.json, feed.xml, sitemap.xml
          {'\n\n'}
          <span className="text-fd-primary">✓</span> <span className="text-fd-foreground">Done!</span> 42 posts →
          medmark/output
        </code>
      </pre>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-fd-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,var(--color-fd-primary),transparent)] opacity-[0.07] dark:opacity-[0.15]"
        />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="flex flex-col items-start gap-6">
            <MedmarkLogo height={34} className="text-fd-foreground" />
            <span className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground">
              <span className="size-1.5 rounded-full bg-fd-primary" />
              Open source · MIT licensed
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-fd-foreground sm:text-5xl">
              Your Medium archive,
              <br />
              as Markdown you own.
            </h1>
            <p className="max-w-xl text-lg text-fd-muted-foreground">
              medmark turns a Medium export into clean Markdown or MDX — front matter, images, embeds and a content
              registry — ready to drop into Next.js, Astro, Hugo or anything else.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground no-underline transition-opacity hover:opacity-90"
              >
                Read the docs
                <ArrowRight className="size-4" />
              </Link>
              <CopyButton value="npx medmark" />
            </div>
          </div>
          <TerminalMock />
        </div>
      </section>

      {/* ── Agent skill ────────────────────────────────── */}
      <section className="border-b border-fd-border bg-fd-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="flex flex-col items-start gap-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-fd-primary/30 bg-fd-primary/10 px-3 py-1 text-xs font-medium text-fd-primary">
                <Sparkles className="size-3.5" />
                Built for coding agents
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-fd-foreground">
                Let your agent do the whole migration
              </h2>
              <p className="max-w-xl text-fd-muted-foreground">
                medmark ships an <Link href="/docs/agent-skill">agent skill</Link> for Claude Code, Codex, Cursor and
                friends. It runs the conversion, scaffolds an Astro blog from the generated posts, previews it locally
                and walks you through deploying it.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <CopyButton value="npx skills add brionmario/medmark" />
                <Link
                  href="/docs/agent-skill"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-foreground no-underline hover:text-fd-primary"
                >
                  How it works
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <p className="text-sm text-fd-muted-foreground">
                These docs are <Link href="/docs/llms">agent-readable</Link> too — llms.txt, llms-full.txt, and a
                Markdown copy of every page.
              </p>
            </div>

            <div className="rounded-xl border border-fd-border bg-fd-background p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-fd-foreground">
                <Bot className="size-4 text-fd-primary" />
                Ask your agent
              </div>
              <p className="m-0 rounded-lg border border-fd-border bg-fd-card p-4 font-mono text-sm text-fd-muted-foreground">
                “Convert my Medium export to Markdown and get it hosted.”
              </p>
              <ol className="m-0 mt-5 list-none space-y-3 p-0 text-sm text-fd-muted-foreground">
                {[
                  'Runs the medmark CLI over your archive',
                  'Builds an Astro blog from the output',
                  'Previews it, then deploys it',
                ].map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-fd-border text-[0.7rem] text-fd-foreground">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="border-b border-fd-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-fd-foreground">What you get</h2>
          <p className="mt-3 max-w-2xl text-fd-muted-foreground">Everything Medium gave you, in files you control.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({body, icon: Icon, title}) => (
              <div
                key={title}
                className="rounded-xl border border-fd-border bg-fd-card p-6 transition-colors hover:border-fd-primary/40"
              >
                <Icon className="size-5 text-fd-primary" />
                <h3 className="mt-4 text-base font-semibold text-fd-foreground">{title}</h3>
                <p className="mt-2 text-sm text-fd-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ──────────────────────────────────────── */}
      <section className="border-b border-fd-border bg-fd-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-fd-foreground">Three steps</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map(({body, code, title}, index) => (
              <div key={title} className="flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-background p-6">
                <span className="font-mono text-xs text-fd-primary">0{index + 1}</span>
                <h3 className="m-0 text-base font-semibold text-fd-foreground">{title}</h3>
                <p className="m-0 text-sm text-fd-muted-foreground">{body}</p>
                <code className="mt-auto block overflow-x-auto rounded-lg border border-fd-border bg-fd-card px-3 py-2 font-mono text-xs text-fd-foreground">
                  {code}
                </code>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground no-underline transition-opacity hover:opacity-90"
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-semibold text-fd-foreground no-underline transition-colors hover:border-fd-primary/40 hover:bg-fd-accent"
            >
              See who’s using it
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm text-fd-muted-foreground">
        <MedmarkLogo height={18} className="text-fd-muted-foreground" />
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/docs" className="text-fd-muted-foreground no-underline hover:text-fd-foreground">
            Documentation
          </Link>
          <Link href="/showcase" className="text-fd-muted-foreground no-underline hover:text-fd-foreground">
            Showcase
          </Link>
          <a
            href="https://github.com/brionmario/medmark"
            className="text-fd-muted-foreground no-underline hover:text-fd-foreground"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/medmark"
            className="text-fd-muted-foreground no-underline hover:text-fd-foreground"
          >
            npm
          </a>
        </div>
        <span>MIT © Brion Mario</span>
      </footer>
    </main>
  );
}
