/**
 * MIT License
 *
 * Copyright (c) 2022, Brion Mario.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @fileoverview Utils related to scraping pages and converting them to markdown
 */

import TurndownService, {Node} from 'turndown';
import {EMBEDDED_TWEET_HTML_SPIT_DELIMITER} from './constants';
import {MedMarkTemplateOptions} from './models';

/**
 * Removes the specified HTML tags and their contents from the input HTML string using Turndown Service.
 * @param tags - An array of tag names to remove, e.g. ['style', 'script', 'meta', 'img'].
 * @returns - The input HTML string with the specified tags and their contents removed.
 */
export function removeTags(turndownService: TurndownService, tags: string[]): void {
  turndownService.remove(tags);
}

/**
 * Adds a rule to replace embedded YouTube videos with an iframe element.
 *
 * @param turndownService - The Turndown service instance to add the rule to.
 */
export function addEmbeddedYoutubeRule(turndownService: TurndownService): void {
  turndownService.addRule('embedded-youtube', {
    /**
     * Checks if the node is a <figure> tag containing a YouTube iframe.
     * @param node - The node to check.
     * @returns True if the node is a <figure> tag containing a YouTube iframe, false otherwise.
     */
    filter(node: Node): boolean {
      if (
        node.nodeName === 'FIGURE' &&
        node.children[0].nodeName === 'IFRAME' &&
        node.children[0].getAttribute('src')?.startsWith('https://www.youtube.com/embed')
      ) {
        return true;
      }

      return false;
    },
    /**
     * Replaces the <figure> tag with an iframe element.
     * @param content - The content of the <figure> tag.
     * @param node - The <figure> tag.
     * @returns The iframe element.
     */
    replacement(content: string, node: Node): string {
      // space at end needed, so several next to each other don't run together
      return `<iframe src="${node.children[0].getAttribute(
        'src',
      )}" width="100%" height="393" frameborder="0" scrolling="no" />`;
    },
  });
}

/**
 * Adds a Turndown rule for embedded tweets.
 * @param turndownService - The TurndownService instance to add the rule to.
 */
export function addEmbeddedTweetRule(turndownService: TurndownService): void {
  turndownService.addRule('embedded-tweets', {
    /**
     * Checks if the node is a <figure> tag containing a Twitter blockquote.
     * @param node - The node to check.
     * @returns True if the node is a <figure> tag containing a Twitter blockquote, false otherwise.
     */
    filter(node: Node) {
      if (
        node.nodeName === 'FIGURE' &&
        node.children[0].nodeName === 'BLOCKQUOTE' &&
        node.children[0].getAttribute('class') === 'twitter-tweet'
      ) {
        return true;
      }

      return false;
    },
    /**
     * Replaces the <figure> tag with the embedded tweet.
     * @param content - The content of the <figure> tag.
     * @returns The embedded tweet.
     */
    replacement(content: string) {
      const contentTokens: string[] = content.split('\n').filter(Boolean);
      const embeddedTweet: string = contentTokens[0].split(
        turndownService.escape(EMBEDDED_TWEET_HTML_SPIT_DELIMITER),
      )[1];

      // Replace <br> tags with <br></br> to make the output valid XML.
      return embeddedTweet.replaceAll('<br>', '<br></br>');
    },
  });
}

/**
 * Parses images with captions in the following format.
 *
 * <figure>
 *   <img ... />
 *   <figcaption>Some Caption</figcaption>
 * </figure>
 *
 * Translates it to Markdown syntax.
 *
 * ![CAPTION](<IMAGE URL>)
 *
 * @param turndownService - The TurndownService instance to add the rule to.
 */
export function addImageFigcaptionRule(turndownService: TurndownService): void {
  /**
   * Checks if the node is a <figure> tag containing an <img> tag.
   * @param node - The node to check.
   * @returns True if the node is a <figure> tag containing an <img> tag, false otherwise.
   */
  turndownService.addRule('image-figcaption', {
    filter(node: Node): boolean {
      if (node.nodeName === 'FIGURE' && node.childNodes[0].nodeName === 'IMG') {
        return true;
      }

      return false;
    },
    /**
     * Replaces the <figure> tag with an image markdown syntax.
     * @param content - The content of the <figure> tag.
     * @returns The image markdown syntax.
     */
    replacement(content: string): string {
      const contentTokens: string[] = content.split('\n').filter(Boolean);

      if (contentTokens.length > 1) {
        const imgAsMarkdown: string = contentTokens[0];

        if (contentTokens[1] && imgAsMarkdown.includes('![]')) {
          return imgAsMarkdown.replace('![]', `![${contentTokens[1]}]`);
        }

        return imgAsMarkdown;
      }

      return content;
    },
  });
}

/**
 * Parse medium HTML code containing links inside <figcaption> tags.
 * Replaces them with <a> tags so that Gatsby can render them as links instead of markdown.
 *
 * @example
 * Medium HTML code: <figcaption><a href="https://example.com">Link text</a></figcaption>
 * Resulting Markdown code: <a href="https://example.com">Link text</a>
 *
 * @param {TurndownService} turndownService - The Turndown service instance to add the rule to.
 */
export function addParseFigcaptionLinksRule(turndownService: TurndownService): void {
  turndownService.addRule('figcaption-links', {
    /**
     * Checks if the node is a <a> tag inside a <figcaption> tag.
     * @param node - The node to check.
     * @returns True if the node is a <a> tag inside a <figcaption> tag, false otherwise.
     */
    filter(node: Node): boolean {
      if (node.nodeName === 'A' && node.parentNode?.nodeName === 'FIGCAPTION') {
        return true;
      }

      return false;
    },
    /**
     * Replaces the content of a code block with a markdown formatted block including
     * @param content - The content of the node.
     * @param node - The node to replace.
     * @returns The replacement string.
     */
    replacement(content: string, node: Node): string {
      const linkHref: string = node.getAttribute('href');
      const linkText: string = node.textContent ?? '';

      return `<a href="${linkHref}" class="figcaption-link">${linkText}</a>`;
    },
  });
}

/**
 * Parses code blocks in single or multi-line format and generates corresponding markdown.
 *
 * @param turndownService - The instance of Turndown Service.
 * @param templateOptions - The options containing the default code block language.
 * @returns void
 */
export function addParseCodeBlocksRule(
  turndownService: TurndownService,
  templateOptions: MedMarkTemplateOptions,
): void {
  turndownService.addRule('pre', {
    /**
     * Determines if a node is a <pre> tag.
     */
    filter: ['pre'],
    /**
     * Replaces the content of a code block with a markdown formatted block including the specified language.
     *
     * @param content - The content of the code block.
     * @returns The markdown formatted code block.
     */
    replacement(content: string): string {
      const lang: string = templateOptions.defaultCodeBlockLanguage;
      return `
\`\`\`${lang}
${content}
\`\`\`
`;
    },
  });
}

/**
 * Adds a Turndown rule to handle fenced links.
 * @param turndownService - The Turndown service instance to add the rule to.
 */
export function addFencedLinkRule(turndownService: TurndownService): void {
  turndownService.addRule('fenced-link', {
    /**
     * Determines if a node is a <code> tag with only 1 child that is an <a> tag.
     * @param node - The node to check.
     * @returns Whether or not the node is a <code> tag with only 1 child that is an <a> tag.
     */
    filter(node: Node): boolean {
      if (node.nodeName === 'CODE' && node.children.length === 1 && node.children[0].nodeName === 'A') {
        return true;
      }

      return false;
    },
    /**
     * Replaces a <code><a></a></code> tag with an <a> tag with a class of "fenced-link".
     * @param content - The content of the code block.
     * @param node - The <code><a></a></code> node to replace.
     * @returns The markdown formatted link.
     */
    replacement(content: string, node: Node): string {
      const linkHref: string = node.children[0].getAttribute('href');
      const linkText: string = node.children[0].textContent ?? '';

      return `<a href="${linkHref}" class="fenced-link">${linkText}</a>`;
    },
  });
}

/**
 * Add a Turndown rule to handle <pre><code> blocks.
 * <pre> is converted to ```. <code> is converted to ``.
 * <pre><code> should be converted to ``` and NOT ```\n`.
 *
 * @param {TurndownService} turndownService - The Turndown service instance to add the rule to.
 */
export function addPreAndCodeRule(turndownService: TurndownService): void {
  turndownService.addRule('pre-and-code', {
    /**
     * Returns true if the node is a <code> element with a parent <pre> element.
     * @param node - The HTML node being checked.
     * @returns True if the node is a <code> element with a parent <pre> element.
     */
    filter(node: Node): boolean {
      if (node.nodeName === 'CODE' && node.parentNode.nodeName === 'PRE') {
        return true;
      }

      return false;
    },
    /**
     * Replaces the content of the <pre><code> block with the same content but wrapped in triple backticks (```).
     * If the content starts and ends with backticks, remove them to prevent the closing backticks from being doubled.
     *
     * @param content - The content of the <pre><code> block.
     * @returns The same content but wrapped in triple backticks (```).
     */
    replacement(content: string) {
      let replacementContent: string = content;

      // if content starts and ends with backticks, remove them
      if (content.startsWith('`') && content.endsWith('`')) {
        replacementContent = content.slice(1, -1);
      }

      return replacementContent;
    },
  });
}

/**
 * Adds a Turndown rule to convert Medium article titles to `h1` tags.
 *
 * @param {TurndownService} turndownService - The Turndown service instance to add the rule to.
 */
export function addTitleRule(turndownService: TurndownService): void {
  turndownService.addRule('title', {
    /**
     * Filters out `h3` tags with the `graf--title` class and returns `true` to call `replacement()`.
     *
     * @param node - The HTML node to filter.
     * @returns `true` if the node is an `h3` tag with the `graf--title` class, `false` otherwise.
     */
    filter(node: Node): boolean {
      // start at the <figure> node because we want to exclude it
      if (node.nodeName === 'H3' && node.getAttribute('class')?.includes('graf--title')) {
        return true;
      }

      return false;
    },
    /**
     * Replaces the content of the `h3` tag with a markdown formatted `h1` tag.
     *
     * @param content - The content of the `h3` tag.
     * @returns The markdown formatted `h1` tag.
     */
    replacement(content: string): string {
      return `# ${content}\n\n`;
    },
  });
}

/**
 * Registers an array of Turndown plugins with a given Turndown service instance.
 * @param {TurndownService} turndownService - The Turndown service instance to register the plugins with.
 * @param {Array<TurndownPlugin>} plugins - An array of Turndown plugins to register.
 */
export function registerPlugins(turndownService: TurndownService, plugins: TurndownService.Plugin[]): void {
  plugins.forEach((plugin: TurndownService.Plugin) => turndownService.use(plugin));
}
