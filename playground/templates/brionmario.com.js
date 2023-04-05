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

const YAML = require('json-to-pretty-yaml');

module.exports = {
  /**
   * Returns an object with default options for rendering markdown.
   * @returns {Object} Object containing default options.
   */
  getOptions() {
    return {
      defaultCodeBlockLanguage: 'js', // Set default language for code blocks.
      folderForEachSlug: true, // Create a separate folder for each blog post.
      imagePath: '/resources', // Path for images referenced in markdown files.
      imageStorageStrategy: 'REMOTE', // Where to store images.
    };
  },

  /**
   * Takes a data object and returns a string of front matter and markdown body.
   * @param {Object} data Data object containing blog post information.
   * @returns {string} String containing front matter and markdown.
   */
  render(data) {
    // Convert published date to YYYY-MM-DD format.
    const date = new Date(data.published);
    const prettyDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date
      .getDate()
      .toString()
      .padStart(2, 0)}`;

    /* eslint-disable sort-keys */
    const frontMatterAsJSON = {
      slug: `/posts/${data.titleForSlug}/`,
      date: prettyDate,
      title: data.title,
      description: data.description,
      authors: data.authors,
      readingTime: data.readingTime,
      draft: data.draft,
      categories: data.categories,
      tags: data.tags,
      bannerImage: data.images.map(image => image.mediumUrl)[0],
      ogImage: data.images.map(image => image.mediumUrl)[0],
      images: data.images.map(image => image.mediumUrl),
    };
    /* eslint-enable sort-keys */

    const frontMatter = `\
---
${YAML.stringify(frontMatterAsJSON)}
---

${data.body}
`;

    return frontMatter;
  },
};
