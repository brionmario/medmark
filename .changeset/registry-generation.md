---
'medmark': minor
---

Generate a content registry alongside converted posts.

Every run now aggregates a machine-readable index of the generated posts (slug, title, date, tags, authors, reading time, banner image, on-disk path, and source Medium URL) and writes it to the output root. This is wired through the template contract via two new optional hooks — `buildRegistryEntry(post, ctx)` (control the per-post shape) and `serializeRegistry(registry, ctx)` (control the output format) — so it works out of the box with the built-in default template but is fully overridable in userland templates.

Configurable via the new `registry` block in template options, with support for `json` (`registry.json`), `ts` (typed `registry.ts` module), `rss` (`feed.xml`) and `sitemap` (`sitemap.xml`) formats. RSS/sitemap require `registry.site.url`. Drafts are included in the JSON/TS manifests (flagged) and excluded from the RSS/sitemap feeds unless `registry.includeDrafts` is set.
