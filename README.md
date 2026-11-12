<p align="center">
  <a href="https://brionmario.github.io/medmark">
    <img src="https://raw.githubusercontent.com/brionmario/medmark/main/apps/website/static/assets/images/brand/banner.svg" alt="medmark — export your Medium articles to Markdown" width="100%">
  </a>
</p>

<p align="center">
  <a href="https://badge.fury.io/js/medmark"><img src="https://badge.fury.io/js/medmark.svg" alt="npm version"></a>
  <a href="https://github.com/brionmario/medmark/actions/workflows/build.yml"><img src="https://github.com/brionmario/medmark/actions/workflows/build.yml/badge.svg" alt="Build"></a>
  <a href="https://github.com/brionmario/medmark/actions/workflows/release.yml"><img src="https://github.com/brionmario/medmark/actions/workflows/release.yml/badge.svg" alt="Release"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License"></a>
  <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
  <a href="#contributors-"><img src="https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square" alt="All Contributors"></a>
  <!-- ALL-CONTRIBUTORS-BADGE:END -->
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-yellow.svg" alt="Commitizen friendly"></a>
</p>

<p align="center">
  <b>medmark</b> turns a Medium export into clean Markdown or MDX — front matter, images,
  embeds and a content registry — ready for Next.js, Astro, Hugo or anything else.
</p>

<p align="center">
  <a href="https://brionmario.github.io/medmark/docs"><b>Documentation</b></a> ·
  <a href="https://brionmario.github.io/medmark/docs/getting-started">Getting started</a> ·
  <a href="https://brionmario.github.io/medmark/docs/cli-reference">CLI reference</a> ·
  <a href="https://brionmario.github.io/medmark/docs/agent-skill">Agent skill</a> ·
  <a href="https://brionmario.github.io/medmark/showcase">Showcase</a>
</p>

---

## Documentation

Everything lives at **[brionmario.github.io/medmark](https://brionmario.github.io/medmark/docs)**:

|                                                                              |                                                   |
| ---------------------------------------------------------------------------- | ------------------------------------------------- |
| [Getting started](https://brionmario.github.io/medmark/docs/getting-started) | Export your archive and run your first conversion |
| [CLI reference](https://brionmario.github.io/medmark/docs/cli-reference)     | Every command and flag                            |
| [Configuration](https://brionmario.github.io/medmark/docs/configuration)     | Options, image strategies, skips and drafts       |
| [Templates](https://brionmario.github.io/medmark/docs/templates)             | Control the shape of the generated files          |
| [Content registry](https://brionmario.github.io/medmark/docs/registry)       | A manifest of your posts, plus RSS and a sitemap  |
| [Agent skill](https://brionmario.github.io/medmark/docs/agent-skill)         | Let a coding agent convert _and_ host your blog   |
| [Docs for AI](https://brionmario.github.io/medmark/docs/llms)                | `llms.txt` and Markdown copies of every page      |

## For AI agents

medmark ships an [agent skill](https://brionmario.github.io/medmark/docs/agent-skill) for Claude Code, Codex, Cursor and
friends. Installed, it takes the migration end to end — conversion, a blog built from the output, and the deploy. The
skill and its Astro starter live in [`skills/medmark`](./skills/medmark).

## Showcase

Moved your writing across with medmark?
[Add your site to the showcase](https://brionmario.github.io/medmark/docs/showcase) — it's a one-line change to a JSON
file. There's a [badge](https://brionmario.github.io/medmark/docs/showcase#badge) too.

## Contributing

Bug reports, code and documentation improvements are all welcome — see the [contributing guidelines](./CONTRIBUTING.md).

## License

MIT © [Brion Mario](https://github.com/brionmario). See [LICENSE](./LICENSE).
