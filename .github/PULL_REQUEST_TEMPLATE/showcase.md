## Site

<!-- The name and URL of the site you're adding. -->

- **Name:** `<site name>`
- **URL:** `<https://example.com/blog>`
- **Source repo (optional):** `<https://github.com/you/your-site>`

## How medmark was used

<!--
A sentence or two: which posts were converted, whether you used a custom
template, which image strategy, anything notable. This is the interesting
part for other people reading the showcase.
-->

## Checklist

<!-- Mark the items that are applicable by replacing [ ] with [x]. -->

- [ ] The site is publicly reachable over HTTPS.
- [ ] At least some of its content was converted with medmark.
- [ ] I only touched `apps/website/content/showcase.json`.
- [ ] The entry is for **one** site.
- [ ] `description` is a single sentence, 160 characters or fewer.
- [ ] The `sites` array is still sorted by `name`.
- [ ] `url` links to the page built from medmark output, not just the homepage.
- [ ] The JSON still parses (`pnpm --filter @medmark/website build` succeeds).

## Additional Notes

<!-- Anything else the reviewer should know. Add `N/A` if there's nothing to mention. -->
