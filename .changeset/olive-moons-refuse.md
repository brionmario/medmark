---
'medmark': minor
---

Take the Medium export in whatever shape you have it, and stop printing scrape failures on ordinary runs.

`--input` now accepts the `.zip` Medium emails you, the folder you unzipped it to, or the `posts` folder inside it. Zips
are unpacked under `.medmark/extracted/` using `tar`, which ships with macOS, Linux and Windows 10 or later; if it is
missing, medmark says so and asks you to unzip by hand rather than failing on a spawn error. The interactive prompt asks
for the export rather than the `posts` folder, and the configuration summary shows the folder that was resolved.

Also in this release:

- Added `-y, --yes`, and a non-TTY stdin now takes the same path automatically. The previously documented
  "non-interactive form" was not non-interactive: `medmark --input … --output …` always asked "Configure advanced
  options?", so it hung in CI and crashed in `uv_tty_init` with no TTY. A non-interactive run with a missing input path
  now exits 1 with a readable message.
- `debug` defaulted to `true`, so every run behaved like a debug run: Apollo state scrape failures were printed for
  every post and debug logs were written when nobody asked for them. It now defaults to `false`, which also makes
  `--debug` mean something, and makes an ordinary run considerably faster.
- The Apollo state parse failure is logged only under `--debug`. The underlying parse failure is unchanged; it is
  survivable, as the post still converts without the tags and authors it carries.
