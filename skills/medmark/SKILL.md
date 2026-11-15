---
name: medmark
description:
  Export Medium articles to Markdown with medmark and publish them as a hosted blog. Use when the user mentions medmark,
  a Medium export/archive (medium-export.zip, posts/*.html), converting Medium posts to Markdown/MDX, or wants to
  preview, host, or deploy the generated blog posts to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
license: MIT
metadata:
  repository: https://github.com/brionmario/medmark
---

# medmark

Turn a Medium archive into Markdown, then put it online as the user's own personal blog.

Three jobs, in this order:

1. **Convert** — run the `medmark` CLI over a Medium export to produce Markdown.
2. **Personalise** — find out whose blog this is, and fill in the site with their details.
3. **Host** — drop the Markdown into the Next.js blog in `scaffold/`, preview it, deploy it.

If the user already has Markdown from a previous run, skip straight to [Personalise](#2-make-it-their-blog).

## 1. Convert a Medium archive

**Prerequisites:** Node.js (LTS) and the user's Medium archive.

### Find the archive first

Before running anything, locate the archive. It is a folder (or a `.zip` of one) containing a `posts/` directory full
of `.html` files — names look like `2019-04-01_My-post-title-abc123def.html`. Look in, roughly this order:

1. A path the user named in the conversation.
2. The working directory: `medmark/medium-export/`, `medium-export/`, `./posts/`.
3. The usual download spots: `~/Downloads`, `~/Desktop` — `medium-export*.zip`, `medium-export/`.

```bash
find . ~/Downloads ~/Desktop -maxdepth 3 \( -name "medium-export*" -o -name "medium_export*" \) 2>/dev/null
```

**If you cannot find one, stop and ask the user — do not run the CLI against a guess and do not invent sample posts.**

Ask properly: if your host gives you an interactive question tool (Claude Code's does), use it, with "I have the
archive" and "I haven't exported it yet" as the choices — a dialog they can answer in one click beats a wall of text.
Without such a tool, ask in your message and end the turn. Ask for their details in the same breath — see
[Ask who the blog belongs to](#ask-who-the-blog-belongs-to) — so they are not interrupted twice.

Then cover whichever applies:

- _They have it already:_ ask for the path to the unzipped folder (or the `.zip`), then carry on. Unzip it yourself if
  they give you a zip.
- _They do not have it yet:_ exporting is theirs to do — you cannot download it for them. Tell them:
  1. Open <https://medium.com/me/settings> (the Security and apps tab) → "Download your information" → **Download**.
  2. Confirm with the password prompt, then wait for Medium's email ("Your Medium export is ready") — usually minutes,
     sometimes hours.
  3. Download the zip from the link in that email and tell you where it landed.

  Then end your turn. Pick this up when they come back with the file rather than polling or waiting.

If you find something ambiguous — several candidate folders, or a folder with no `posts/` inside — say what you found
and let the user pick, rather than choosing for them.

### Run the conversion

Only once you have the archive in hand. Work inside the directory where the user wants the output.

```bash
npx medmark init
```

`init` scaffolds the working folders:

```
medmark/
├── medium-export/        # unzip the Medium archive here (must contain posts/)
└── templates/            # optional custom templates
.medmark/logs/            # run logs
```

Copy the archive you located into `medmark/medium-export/` — the `posts/` folder with the `.html` files must end up
directly inside it. Then run:

```bash
npx medmark
```

The CLI prompts for the input folder, output folder and template, defaulting to `medmark/medium-export/posts` and
`medmark/output`. Non-interactive form:

```bash
npx medmark --input medmark/medium-export/posts --output medmark/output
```

Other flags: `-t, --template <file>`, `-d, --drafts`, `-s, --skip <files>`, `-D, --debug`. Run `npx medmark --help` to
confirm them for the installed version rather than guessing. Full CLI and configuration
reference: <https://brionmario.github.io/medmark/docs>.

### What the default template produces

```
medmark/output/
├── my-first-post/
│   └── index.md
├── another-post/
│   └── index.md
└── registry.json          # manifest of every generated post
```

Each `index.md` starts with YAML front matter:

```yaml
---
slug: /posts/my-first-post/
date: 2023-04-01
title: My First Post
description: ...
authors:
  - name: Brion Mario
readingTime: 5 min read
draft: false
categories: [...]
tags: [...]
bannerImage: https://cdn-images-1.medium.com/...
ogImage: https://cdn-images-1.medium.com/...
images: [...]
---
```

Images default to `imageStorageStrategy: 'REMOTE'` — the Markdown points at Medium's CDN, so nothing extra needs
hosting. With `'LOCAL'`, images are written next to each post under the configured `imagePath` (default `/resources`);
see [Local images](#local-images) below when hosting those.

A custom template can change all of this. Read `registry.json` (or the generated front matter itself) before assuming
field names.

## 2. Make it their blog

The goal is **the user's personal blog** — their name, their words, their links — not a visible "medmark export". A
site that ships saying `Your Name` is a failed job, so gather the details before you build anything.

### Ask who the blog belongs to

Ask once, early, with your host's interactive question tool if you have one (Claude Code: AskUserQuestion). Offer
these ways to answer:

- **"I'll paste my LinkedIn"** — the fastest route for most people.
- **"I'll type the details"** — name, what they do, a one-line tagline, links.
- **"Just use my posts"** — minimal: name and links only, with the tagline drawn from what they actually write about.

Whatever they pick, you need at most these, and the site works with the first two alone:

| Field | Comes from | Used for |
| --- | --- | --- |
| Name | them | header, copyright, meta tags |
| Role | LinkedIn headline, or them | line under the tagline |
| Location | LinkedIn, or them | same line (skip if they'd rather not say) |
| Tagline | them, or draft one from their posts | the first line a reader sees |
| About | LinkedIn "About", or them | home intro + `/about/` |
| Work | LinkedIn "Experience" | `/about/` |
| Links | them | header, footer, `/about/` |

### Reading a LinkedIn profile

LinkedIn blocks automated fetching: a plain `curl` or fetch of a profile URL returns a login wall or an
authentication error, not the profile. So:

1. If you have a browser tool **and** the user is already signed in to LinkedIn there, open the profile URL they gave
   you and read the page. Do not sign in on their behalf or enter credentials.
2. Otherwise, ask them to paste the profile text — the "About" section and their recent roles are enough. Say that
   plainly instead of silently giving up on the URL they handed you.

Pull out only what the profile actually says: name, headline, location, the About paragraphs, and recent roles with
titles, companies and dates. **Never invent a career.** No made-up employers, dates, degrees or achievements, and no
LinkedIn marketing voice ("passionate about leveraging…") unless that is genuinely how they wrote it. Where the
profile is thin, leave the field empty — every section of the scaffold hides itself when its field is empty.

Then show them the filled-in config and get an OK before deploying. A LinkedIn profile is semi-private; a personal
blog is fully public, and employer names, location and dates are theirs to publish or withhold.

## 3. Build the site

The skill ships a small, production-ready **Next.js 16** blog in `scaffold/`:

- App Router, TypeScript, Tailwind CSS v4, statically exported (`output: 'export'`) — `out/` is plain HTML
- Posts grouped by year, excerpts that strip the title Medium repeats into the body
- Post pages with tags, reading time and older/newer links; tag pages; an about page
- RSS feed, sitemap, robots.txt and a 404 page
- Light and dark themes with a toggle that remembers the choice, following the OS until it is used
- Serif display type (Instrument Serif) over Inter, on a warm paper-and-ink palette with one accent colour

Markdown is rendered at build time through remark/rehype with `rehype-raw`, **not** MDX: Medium exports carry raw HTML
(figures, captions, iframes) that MDX rejects. Code blocks are highlighted by Shiki in both themes. Front matter is
read leniently — unknown keys are ignored, missing ones degrade gracefully — so custom medmark templates still render.

### Create the site

```bash
cp -R <skill-dir>/scaffold my-blog
cd my-blog
```

`<skill-dir>` is wherever this skill is installed (for example `~/.claude/skills/medmark` or `.claude/skills/medmark`).

Then copy the posts in — the scaffold reads `content/posts/`:

```bash
cp -R ../medmark/output/. content/posts/
```

### Fill in site.config.ts

`site.config.ts` at the root of the scaffold is the whole identity of the blog. It is typed and commented; fill it
with what you gathered in step 2:

```ts
export const site: SiteConfig = {
  name: 'Ada Lovelace',
  role: 'Compiler engineer',
  location: 'Cambridge, UK',
  tagline: 'Notes on compilers, and the occasional detour.',
  description: 'Essays on compilers and language design by Ada Lovelace.',
  url: 'https://ada.dev',
  avatar: '/avatar.jpg',
  about: ['I build language tooling…', 'Before that…'],
  now: 'Working on an incremental type checker.',
  work: [{role: 'Principal Engineer', company: 'Analytical Engines', period: '2021 — now'}],
  nav: [{label: 'Writing', href: '/'}, {label: 'About', href: '/about/'}],
  links: [{label: 'GitHub', href: 'https://github.com/ada'}, {label: 'RSS', href: '/rss.xml'}],
};
```

Rules that matter:

- **name** is the person, not a product. `"My Blog"` shipping to production is a failure.
- **tagline** is the line readers see first. One sentence in their voice. Offer a draft and let them correct it rather
  than asking them to compose from scratch.
- **description** goes in meta tags and the RSS feed. Never leave it mentioning medmark or Medium.
- **url** matters before deploying: canonical links, RSS and the sitemap need it (or `SITE_URL` in the environment).
- **about** empty means no `/about/` page and no home intro — that is fine, and better than filler. The `About` nav
  item removes itself.
- **links** — their real accounts, or drop the row. A dead link to a stranger's profile is worse than no link.
- **avatar** — only if they give you an image; drop it in `public/` first.

Also before you call it done:

- **Swap `public/favicon.svg`.** It ships as a placeholder circle. Their initial, or an icon they provide.
- **Check the excerpts.** `app/lib/posts.ts` strips the title where Medium repeated it into the body. Read the
  rendered list; if an excerpt still starts mid-sentence or repeats the heading, fix that post's `description` front
  matter.
- **Check the titles and dates** against what the posts were on Medium. A conversion glitch is easiest to spot here.
- **Remove posts they don't want public.** Medium exports everything, including drafts and one-line replies. Ask
  before deleting anything.
- **Keep editing cheap.** Tell them where things are: the palette is six CSS variables at the top of
  `app/globals.css`, the post body styling is the `.prose` block below it, and the pages are short files under `app/`.
  This is a site they own, not a generated artifact they're stuck with.

If the user already has a site, say so plainly: copying `content/posts/` into their existing blog is usually less work
than adopting this scaffold.

### Preview

```bash
npm install
npm run dev
```

Next serves on <http://localhost:3000>. Open it and check that posts list and render before telling the user it works.
Drafts (`draft: true`) are visible in dev and dropped from production builds.

```bash
npm run build    # static site in out/
npm run start    # serve the built out/ directory
```

### Local images

If the posts were generated with `imageStorageStrategy: 'LOCAL'`, the Markdown references the `imagePath` as a
site-absolute path (default `/resources/...`). Copy those files into `public/` so the paths resolve:

```bash
cd my-blog
find content/posts -type d -name resources -exec sh -c 'mkdir -p public/resources && cp -R "$0"/. public/resources/' {} \;
```

Then confirm an image loads in the browser — do not assume.

## 4. Deploy

Set the public URL first (`url` in `site.config.ts`, or `SITE_URL` in the host's environment), so canonical links, RSS
and the sitemap are absolute.

The build output is plain static files in `out/`, so any static host works. Pick the one the user already uses;
otherwise Vercel is the shortest path for a Next.js site. Build command `npm run build`, output directory `out`.

**Vercel**

```bash
npx vercel deploy --prod
```

Accept the detected Next.js preset. Or push to GitHub and import the repo at <https://vercel.com/new>.

**Netlify**

```bash
npx netlify deploy --prod --dir out
```

**Cloudflare Pages**

```bash
npx wrangler pages deploy out
```

**GitHub Pages** — two gotchas, both of which break the site silently:

1. Project pages are served from a subpath, so set `basePath: '/<repo>'` in `next.config.ts` (and `url` to
   `https://<user>.github.io/<repo>`) before building. A custom domain or `<user>.github.io` repo needs no `basePath`.
2. Add an empty `.nojekyll` file to `out/` — GitHub Pages otherwise hides the `_next/` directory and the site loads
   without CSS or JavaScript.

Then deploy `out/` with `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`, and set Settings → Pages →
Source to "GitHub Actions".

Deploying publishes the user's writing under their account. Confirm with them before running any deploy command, and
report the resulting URL afterwards.

### Before you call it production-ready

Walk this yourself — don't hand the user a checklist to run.

- [ ] No placeholders left: `Your Name`, the default tagline, the placeholder favicon, an empty `description`.
- [ ] Nothing invented in `site.config.ts` — every role, date and claim came from the user or their profile.
- [ ] `url` (or `SITE_URL`) is the real domain, and `/rss.xml`, `/sitemap.xml` and `/robots.txt` show absolute URLs.
- [ ] `npm run build` is clean, and you have opened `npm run start` — not just the dev server.
- [ ] Open three or four posts, including the oldest and the longest. Check images, code blocks, embeds and links.
- [ ] Look at it at phone width, and flip the theme toggle on both the home page and a post.
- [ ] A made-up URL renders the 404 page, and a tag link from a post lands on a tag page.
- [ ] Drafts and replies the user didn't want are gone from `content/posts/`.
- [ ] If they're keeping the Medium originals up, set `canonicalUrl` in the post's front matter — the post page then
      links back to the original and the canonical tag points there, so search engines know which copy is which.

Then tell the user what you checked and what you couldn't — a broken image behind a Medium CDN redirect, say — rather
than declaring it perfect.

## Keeping it up to date

Re-export from Medium, re-run `npx medmark`, then copy the output over `content/posts/` again and redeploy. Posts
removed from the output stay in `content/posts/` until deleted — clear the folder first for an exact mirror.

## Notes and gotchas

- The scaffold is a starting point, not a framework. If the user wants a different look, change the palette variables
  in `app/globals.css` and the components in `app/components/` — they are short on purpose.
- Posts live in `content/posts/` (not inside `app/`) so the generated output can be replaced wholesale without
  touching the site code.
- Rendering is Markdown → HTML through rehype with raw HTML allowed. Do not switch it to MDX to get components: it
  will fail on Medium's embedded HTML.
- `next/font` downloads Inter and Instrument Serif at build time, so the first build needs network access.
- Medium embeds (tweets, gists, YouTube) come through as HTML or links and render as they are. Add an integration only
  if the user wants richer embeds.
- `registry.json` is handy for building an index, tag pages or a feed in another framework — it carries title, slug,
  path, date, tags, authors and the source URL.
