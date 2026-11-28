---
'medmark': patch
---

Stop repeating the title and lead image inside the converted body.

A Medium export carries the title twice: once as the `h1` in the header, and again as the first block of the body, with
the lead image straight after it. Both are lifted into front matter (`title`, and `bannerImage` from the first image),
so any site that renders front matter and then the body showed each one twice: a heading under the heading, and the hero
image under the hero image.

The body copies are now removed. The title block is matched on Medium's own `graf--title` marker rather than by
comparing text, because the two versions differ more often than you would expect: long titles are truncated with an
ellipsis in the header, and an edit to one is not always applied to the other. Only a figure that comes before any prose
is treated as a lead image, so a post whose first image is genuinely mid-article keeps it.

The `h1` removal that was already there never affected the output, since the header sits outside `.section-content`,
which is what becomes the Markdown.
