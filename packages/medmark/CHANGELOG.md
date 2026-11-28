# medmark

## 0.4.0

### Minor Changes

- [`5d98d1a632e84be1da590518221876f4f59d3392`](https://github.com/brionmario/medmark/commit/5d98d1a632e84be1da590518221876f4f59d3392)
  Thanks [@brionmario](https://github.com/brionmario)! - Take the Medium export in whatever shape you have it, and stop
  printing scrape failures on ordinary runs.

  `--input` now accepts the `.zip` Medium emails you, the folder you unzipped it to, or the `posts` folder inside it.
  Zips are unpacked under `.medmark/extracted/` using `tar`, which ships with macOS, Linux and Windows 10 or later; if
  it is missing, medmark says so and asks you to unzip by hand rather than failing on a spawn error. The interactive
  prompt asks for the export rather than the `posts` folder, and the configuration summary shows the folder that was
  resolved.

  Also in this release:

  - Added `-y, --yes`, and a non-TTY stdin now takes the same path automatically. The previously documented
    "non-interactive form" was not non-interactive: `medmark --input … --output …` always asked "Configure advanced
    options?", so it hung in CI and crashed in `uv_tty_init` with no TTY. A non-interactive run with a missing input
    path now exits 1 with a readable message.
  - `debug` defaulted to `true`, so every run behaved like a debug run: Apollo state scrape failures were printed for
    every post and debug logs were written when nobody asked for them. It now defaults to `false`, which also makes
    `--debug` mean something, and makes an ordinary run considerably faster.
  - The Apollo state parse failure is logged only under `--debug`. The underlying parse failure is unchanged; it is
    survivable, as the post still converts without the tags and authors it carries.

### Patch Changes

- [`e5a5b772c16923b7dde5c404191c1af33f3f3f35`](https://github.com/brionmario/medmark/commit/e5a5b772c16923b7dde5c404191c1af33f3f3f35)
  Thanks [@brionmario](https://github.com/brionmario)! - Load templates that export via `export default`

  Templates compiled from TypeScript (or any module that sets `exports.default`) produce a second level of `default`
  once imported, so they silently fell back to the built-in template. The loader now unwraps nested `default` exports,
  which means CommonJS, ESM, and TypeScript-compiled templates all work.

  Also extracts `MedmarkRegistrySiteOptions` as a named exported interface, and adds the missing `hasClass` declaration
  to the bundled `cheerio` types so the package type-checks cleanly.

- [`03baf486af3d599b37342202c8940d10255ebe0e`](https://github.com/brionmario/medmark/commit/03baf486af3d599b37342202c8940d10255ebe0e)
  Thanks [@brionmario](https://github.com/brionmario)! - Stop repeating the title and lead image inside the converted
  body.

  A Medium export carries the title twice: once as the `h1` in the header, and again as the first block of the body,
  with the lead image straight after it. Both are lifted into front matter (`title`, and `bannerImage` from the first
  image), so any site that renders front matter and then the body showed each one twice: a heading under the heading,
  and the hero image under the hero image.

  The body copies are now removed. The title block is matched on Medium's own `graf--title` marker rather than by
  comparing text, because the two versions differ more often than you would expect: long titles are truncated with an
  ellipsis in the header, and an edit to one is not always applied to the other. Only a figure that comes before any
  prose is treated as a lead image, so a post whose first image is genuinely mid-article keeps it.

  The `h1` removal that was already there never affected the output, since the header sits outside `.section-content`,
  which is what becomes the Markdown.

## 0.3.0

### Minor Changes

- [`422812468a0f346edbcf6fac87e413fee44a4a57`](https://github.com/brionmario/medmark/commit/422812468a0f346edbcf6fac87e413fee44a4a57)
  Thanks [@brionmario](https://github.com/brionmario)! - Generate a content registry alongside converted posts.

  Every run now aggregates a machine-readable index of the generated posts (slug, title, date, tags, authors, reading
  time, banner image, on-disk path, and source Medium URL) and writes it to the output root. This is wired through the
  template contract via two new optional hooks — `buildRegistryEntry(post, ctx)` (control the per-post shape) and
  `serializeRegistry(registry, ctx)` (control the output format) — so it works out of the box with the built-in default
  template but is fully overridable in userland templates.

  Configurable via the new `registry` block in template options, with support for `json` (`registry.json`), `ts` (typed
  `registry.ts` module), `rss` (`feed.xml`) and `sitemap` (`sitemap.xml`) formats. RSS/sitemap require
  `registry.site.url`. Drafts are included in the JSON/TS manifests (flagged) and excluded from the RSS/sitemap feeds
  unless `registry.includeDrafts` is set.

### Patch Changes

- [`5b09b4f369592907c5450f99978e8b7b81b0bd70`](https://github.com/brionmario/medmark/commit/5b09b4f369592907c5450f99978e8b7b81b0bd70)
  Thanks [@brionmario](https://github.com/brionmario)! - ignore possible comments

## 0.2.6

### Patch Changes

- [`58a1887d236770478821a1a51611c0f870d5a0dd`](https://github.com/brionmario/medmark/commit/58a1887d236770478821a1a51611c0f870d5a0dd)
  Thanks [@brionmario](https://github.com/brionmario)! - Fix node issues

## 0.2.5

### Patch Changes

- [`ecc8916999984d65da43591a66f9b29297436eea`](https://github.com/brionmario/medmark/commit/ecc8916999984d65da43591a66f9b29297436eea)
  Thanks [@brionmario](https://github.com/brionmario)! - Trigger release

## 0.2.4

### Patch Changes

- [`5dc9d709d10fb6b1ba9c4c81d5b4567551a7e719`](https://github.com/brionmario/medmark/commit/5dc9d709d10fb6b1ba9c4c81d5b4567551a7e719)
  Thanks [@brionmario](https://github.com/brionmario)! - Fix Chalk ESM issues

## 0.2.3

### Patch Changes

- [`a67badc9051920a2abfc9f9a58e576417b9b3884`](https://github.com/brionmario/medmark/commit/a67badc9051920a2abfc9f9a58e576417b9b3884)
  Thanks [@brionmario](https://github.com/brionmario)! - Improve DX

## 0.2.2

### Patch Changes

- [#25](https://github.com/brionmario/medmark/pull/25)
  [`d53a850`](https://github.com/brionmario/medmark/commit/d53a850e849e50d86a23986a62cb2ed536338353) Thanks
  [@brionmario](https://github.com/brionmario)! - Copy README to dist during build to be available in npm

## 0.2.1

### Patch Changes

- [`c154225`](https://github.com/brionmario/medmark/commit/c15422543b692910e619baeb1aaecd5525bd0e40) Thanks
  [@brionmario](https://github.com/brionmario)! - Restructured the repo with updated README's

## 0.2.0

### Minor Changes

- [#20](https://github.com/brionmario/medmark/pull/20)
  [`9ff5d76`](https://github.com/brionmario/medmark/commit/9ff5d7641811aa18154ca5802992b2feab5ddf8e) Thanks
  [@brionmario](https://github.com/brionmario)! - Add ability to init Medmark by executing `medmark init`.

  ```bash
  medmark init
  ```

  This will do the following.

  - Create a `.medmark` folder at the root of the execution with the following folder structure.

  ```bash
  ├── .medmark
  │   ├── medium-export # Should extract the medium archive here.
  │   │   ├── .gitkeep
  │   ├── templates # Should contain the templates for Medmark.
  │   │   ├── sample-medmark-template.js
  ```
