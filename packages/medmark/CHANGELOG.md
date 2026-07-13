# medmark

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
