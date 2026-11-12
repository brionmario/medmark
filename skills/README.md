# medmark agent skills

Skills that teach coding agents (Claude Code, Codex, Cursor, Copilot, …) how to run medmark and host what it generates.

| Skill                  | What it does                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| [`medmark`](./medmark) | Convert a Medium archive to Markdown, scaffold an Astro blog from the output, preview it and deploy it. |

## Install

With the [`skills`](https://skills.sh) CLI — works across Claude Code, Codex, Cursor and other agents:

```bash
npx skills add brionmario/medmark
```

As a Claude Code plugin:

```bash
/plugin marketplace add brionmario/medmark
```

```bash
/plugin install medmark@medmark
```

Manually — copy the folder into your agent's skills directory:

```bash
git clone https://github.com/brionmario/medmark.git /tmp/medmark && cp -R /tmp/medmark/skills/medmark ~/.claude/skills/medmark
```

## Use

Just ask, once the skill is installed:

> Convert my Medium export to Markdown and get it hosted.

The skill handles the `npx medmark` run, builds an Astro site from the generated posts, previews it locally, and walks
through deploying to Vercel, Netlify, Cloudflare Pages or GitHub Pages.
