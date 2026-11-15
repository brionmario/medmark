import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypeShiki from '@shikijs/rehype';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {unified} from 'unified';

interface HastNode {
  children?: HastNode[];
  properties?: Record<string, unknown>;
  tagName?: string;
  type: string;
}

/**
 * Lazy-load images and send outbound links to a new tab. Posts converted from
 * Medium are image heavy, and the images are usually still on Medium's CDN.
 */
function enhanceNodes() {
  return (tree: HastNode): void => {
    const walk = (node: HastNode): void => {
      if (node.tagName === 'img' && node.properties) {
        node.properties.decoding ??= 'async';
        node.properties.loading ??= 'lazy';
      }

      if (node.tagName === 'a' && node.properties) {
        const href = node.properties.href;

        if (typeof href === 'string' && /^https?:\/\//.test(href)) {
          node.properties.rel ??= 'noreferrer';
          node.properties.target ??= '_blank';
        }
      }

      node.children?.forEach(walk);
    };

    walk(tree);
  };
}

/**
 * Markdown to HTML.
 *
 * Deliberately a plain Markdown pipeline rather than MDX: medmark's output is
 * machine-converted from Medium and carries raw HTML (figures, embeds, iframes)
 * that MDX would reject. `rehype-raw` keeps that HTML, so a post that renders on
 * Medium renders here.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(enhanceNodes)
    .use(rehypeShiki, {
      // Emits CSS variables for both themes, so code blocks follow the toggle.
      defaultColor: false,
      themes: {dark: 'github-dark', light: 'github-light'},
    })
    .use(rehypeStringify, {allowDangerousHtml: true})
    .process(markdown);

  return String(file);
}
