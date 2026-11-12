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

Turn a Medium archive into Markdown, then put it online.

Two jobs, usually in this order:

1. **Convert** — run the `medmark` CLI over a Medium export to produce Markdown.
2. **Host** — drop that Markdown into an Astro site, preview it locally, deploy it.

If the user already has Markdown from a previous run, skip straight to [Host](#2-host-the-generated-posts).

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
Without such a tool, ask in your message and end the turn. Either way, ask for the blog details in the same breath
(title, one-line description, author name as it should appear on posts), so they are not interrupted twice.

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

## 2. Host the generated posts

The skill ships a minimal Astro blog in `scaffold/`: one folder-per-slug content collection, a post list, a post page,
RSS, dark mode, zero config. It reads medmark's default front matter and passes unknown keys through, so custom
templates still render.

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

Edit `src/site.json` with the user's blog title, description and name — the details you asked for earlier. Never invent
them. If you still do not have them, ask now (with the host's question tool where there is one), or leave the
placeholders and say so plainly.

### Preview

```bash
npm install
npm run dev
```

Astro serves on <http://localhost:4321>. Open it and check that posts list and render before telling the user it works.
Drafts (`draft: true`) are visible in dev and hidden in production builds.

```bash
npm run build    # static output in dist/
npm run preview  # serve the production build
```

### Local images

If the posts were generated with `imageStorageStrategy: 'LOCAL'`, the Markdown references the `imagePath` as a
site-absolute path (default `/resources/...`). Copy those files into `public/` so the paths resolve:

```bash
cd my-blog
find content/posts -type d -name resources -exec sh -c 'mkdir -p public/resources && cp -R "$0"/. public/resources/' {} \;
```

Then confirm an image loads in the browser — do not assume.

## 3. Deploy

Set the public URL first, so canonical links and RSS are absolute. Either edit `site` in `astro.config.mjs` or set
`SITE_URL` in the host's environment variables.

The build output is plain static files (`dist/`), so any static host works. Pick the one the user already uses;
otherwise Vercel is the shortest path. Build command `npm run build`, output directory `dist`.

**Vercel**

```bash
npx vercel deploy --prod
```

Accept the detected Astro preset. Or push to GitHub and import the repo at <https://vercel.com/new>.

**Netlify**

```bash
npx netlify deploy --prod --dir dist
```

**Cloudflare Pages**

```bash
npx wrangler pages deploy dist
```

**GitHub Pages** — project pages are served from a subpath, so set both `site` and `base` in `astro.config.mjs`
(`site: 'https://<user>.github.io'`, `base: '/<repo>'`) before building, then add `.github/workflows/deploy.yml` using
`withastro/action@v3` and `actions/deploy-pages@v4`, and set Settings → Pages → Source to "GitHub Actions".

Deploying publishes the user's writing under their account. Confirm with them before running any deploy command, and
report the resulting URL afterwards.

## Keeping it up to date

Re-export from Medium, re-run `npx medmark`, then copy the output over `content/posts/` again and redeploy. Posts
removed from the output stay in `content/posts/` until deleted — clear the folder first for an exact mirror.

## Notes and gotchas

- The scaffold is a starting point, not a framework. If the user wants a different look, edit `src/styles/global.css`
  and the two page files; they are short on purpose.
- The content schema in `src/content.config.ts` marks every field optional and passes unknown keys through. Do not
  tighten it unless the user asks.
- Posts live in `content/posts/` (not `src/content/`) so the generated output can be replaced wholesale without touching
  the site code.
- Medium embeds (tweets, gists, YouTube) come through as HTML or links. They render as they are; add an integration only
  if the user wants richer embeds.
- `registry.json` is handy for building an index, tag pages or a feed in another framework — it carries title, slug,
  path, date, tags, authors and the source URL.
