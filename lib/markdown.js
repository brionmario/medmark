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

var TurndownService = require('turndown');

// global placeholder allowing us to pass in options from the template...
var templateOptions;

var turnDownOptions = {
  // linkReferenceStyle: 'collapsed',
  codeBlockStyle: 'fenced',
};
var turndownService = new TurndownService(turnDownOptions);
// strip <style> and <script> tags and contents
// turndownService.remove(['style', 'script', 'meta', 'img']);
turndownService.remove(['style', 'script', 'meta', 'img']);

// github gist scripts
// turndownService.addRule('script', {
//   filter: ['script'],
//   replacement: function(content, node) {
//     // donwload it?
//     console.log('SCRIP***');
//     var output = `
//     \`\`\`javascript
//     console.log()
//     \`\`\`
//     `;
//     return `\`${content}\``;
//   },
// });

// RULE ORDER MATTERS. Later ones are run first...

// keep figure, figcaption (for images, subtitles) but convert contents to markdown, and remove attributes
// turndownService.addRule('figure', {
//   filter: ['figure'],
//   replacement: function (content) {
//     return `<figure>${content}</figure>`;
//   },
// });

turndownService.addRule('embedded-youtube', {
  filter: function (node, options) {
    // if a <code> tag has only 1 child, and it's a link..., then call replacement()
    // start at the <figure> node because we want to lose that
    if (
      node.nodeName === 'FIGURE' &&
      node.children[0].nodeName === 'IFRAME' &&
      node.children[0].getAttribute('src').startsWith('https://www.youtube.com/embed')
    ) {
      return true;
    }

    return false;
  },
  replacement: function (content, node, options) {
    // space at end needed, so several next to each other don't run together
    return `<iframe src="${node.children[0].getAttribute(
      'src',
    )}" width="100%" height="393" frameborder="0" scrolling="no" />`;
  },
});

turndownService.addRule('embedded-tweets ', {
  filter: function (node, options) {
    // if a <code> tag has only 1 child, and it's a link..., then call replacement()
    // start at the <figure> node because we want to lose that
    if (
      node.nodeName === 'FIGURE' &&
      node.children[0].nodeName === 'BLOCKQUOTE' &&
      node.children[0].getAttribute('class') === 'twitter-tweet'
    ) {
      return true;
    }
    return false;
  },
  // replace <figcaption><a></figcaption></code> with <a class="fenced-link">
  replacement: function (content, node, options) {
    return node.children[0].children[0].getAttribute('href') + ' '; // FIXME: use find() with selectors instead...
  },
});

// turndownService.addRule('figcaption', {
//   filter: ['figcaption'],
//   replacement: function (content, node, options) {
//     return `<figcaption>${content}</figcaption>`;
//   },
// });

/**
 * Parse Images with captions.
 *
 * @example
 * Images are in the following format when exported as `html` from Medium.
 *     <figure>
 *       <img .. />
 *       <figcaption>Some Caption</figcaption>
 *     </figure>
 *
 * For markdown syntax, we need to translate the above in to something like the following.
 *     ![CAPTION](<IMAGE URL>)
 */
turndownService.addRule('image-figcaption', {
  filter: function (node, options) {
    // if a <code> tag has only 1 child, and it's a link..., then call replacement()
    if (node.nodeName === 'FIGURE' && node.childNodes[0].nodeName === 'IMG') {
      return true;
    }

    return false;
  },
  replacement: function (content, node, options) {
    // If the image has captions, turndown gives out in the following format.
    // content [
    //   '![](https://cdn-images-1.medium.com/max/800/1*yhiPhUnIYJ-8RFnOwTTupg.png)',
    //   '',
    //   'Custom Command Error',
    //   ''
    // ]
    // [0]'th index is the image, [2]'nd index contains the caption. And also there are empty elements as well.
    // We need to handle these and translate the content to a syntax that Markdown can understand.

    const contentTokens = content.split('\n').filter(Boolean);

    if (contentTokens.length > 1) {
      const imgAsMarkdown = contentTokens[0];

      // If there's no `alt`, add the `figcaption` text.
      if (contentTokens[1] && imgAsMarkdown.includes('![]')) {
        return imgAsMarkdown.replace('![]', `![${contentTokens[1]}]`);
      }

      return imgAsMarkdown;
    }

    return content;
  },
});

// turn md links inside <figcaption> tags to <a> tags so gatsby renders them as links, instead of markdown
// FIXME: should I just keep the original htmtl from medium?
turndownService.addRule('figcaption-links', {
  filter: function (node, options) {
    // if a <code> tag has only 1 child, and it's a link..., then call replacement()
    if (node.nodeName === 'A' && node.parentNode.nodeName === 'FIGCAPTION') {
      return true;
    }
    return false;
  },
  // replace <figcaption><a></figcaption></code> with <a class="fenced-link">
  replacement: function (content, node, options) {
    var linkHref = node.getAttribute('href');
    var linkText = node.text;
    return `<a href="${linkHref}" class="figcaption-link">${linkText}</a>`;
  },
});

// single line code items...
// THIS ALSO applies for multi line code snippets with ``` on medium...
turndownService.addRule('pre', {
  filter: ['pre'],
  replacement: function (content) {
    var lang = templateOptions.defaultCodeBlockLanguage;
    return `
\`\`\`${lang}
${content}
\`\`\`
`;
  },
});

// Handle fenced links
// <code><a></a></code>
turndownService.addRule('fenced-link', {
  filter: function (node, options) {
    // if a <code> tag has only 1 child, and it's a link..., then call replacement()
    if (node.nodeName === 'CODE' && node.children.length === 1 && node.children[0].nodeName === 'A') {
      return true;
    }
    return false;
  },
  // replace <code><a></a></code> with <a class="fenced-link">
  replacement: function (content, node, options) {
    var linkHref = node.children[0].getAttribute('href');
    var linkText = node.children[0].text;
    return `<a href="${linkHref}" class="fenced-link">${linkText}</a>`;
  },
});

// <pre> is converted to ```. <code> is converted to ``.
// <pre><code> should be converted to ``` and NOT ```\n`
// <pre><code> happens rarely on medium but does happen sometimes
turndownService.addRule('pre-and-code', {
  filter: function (node, options) {
    // if <code> has <pre> parent, call replacement()
    if (node.nodeName === 'CODE' && node.parentNode.nodeName === 'PRE') {
      return true;
    }
    return false;
  },
  replacement: function (content, node, options) {
    // if content starts and ends with backticks, remove them
    if (content.startsWith('`') && content.endsWith('`')) {
      content = content.slice(1, -1);
    }
    return content;
  },
});

// medium does <code></code> for single line snippet
// and <pre><code></code></pre> for multi-line
// this holds true for their site.
// But their export uses <pre /> for multiline, and <code /> for single line

// multi line code items...
// turndownService.addRule('code', {
//   filter: ['code'],
//   replacement: function(content) {
//     return `\`${content}\``;
//   },
// });

// strip links but keep content
// turndownService.addRule('link', {
//   filter: ['a'],
//   replacement: function(content) {
//     return content;
//   },
// });

/**
 * Medium article titles are `h3` tags when exported as html.
 * And they have a a special class to differentiate from other `h3` tags.
 * We need to filter it out and make it a `h1`.
 */
turndownService.addRule('title', {
  filter: function (node, options) {
    // if a <code> tag has only 1 child, and it's a link..., then call replacement()
    // start at the <figure> node because we want to lose that
    if (node.nodeName === 'H3' && node.getAttribute('class').includes('graf--title')) {
      return true;
    }

    return false;
  },
  replacement: function (content) {
    return `# ${content}

`;
  },
});

// takes the code from the jobs page and turns it into markdown so we can show it on the posting page
// TODO: keep headings, lists, etc... everything else should be stripped
// No buttons, no links, no images...
function transformHtmlToMarkdown(code, templateOpts = {}) {
  templateOptions = templateOpts;
  return turndownService.turndown(code);
}

module.exports = {
  transformHtmlToMarkdown,
};
