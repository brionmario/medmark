---
'medmark': patch
---

Load templates that export via `export default`

Templates compiled from TypeScript (or any module that sets `exports.default`)
produce a second level of `default` once imported, so they silently fell back
to the built-in template. The loader now unwraps nested `default` exports,
which means CommonJS, ESM, and TypeScript-compiled templates all work.

Also extracts `MedmarkRegistrySiteOptions` as a named exported interface, and
adds the missing `hasClass` declaration to the bundled `cheerio` types so the
package type-checks cleanly.
