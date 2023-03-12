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
  render: function (data) {
    // data.published is Date ISO format: 2018-04-16T14:48:00.000Z
    // We need to convert it to something like 2018-04-16.
    const date = new Date(data.published);
    const prettyDate =
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1).toString().padStart(2, 0) +
      '-' +
      date.getDate().toString().padStart(2, 0);

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

    const frontMatter = `\
---
${YAML.stringify(frontMatterAsJSON)}
---

${data.body}
`;

    return frontMatter;
  },
  getOptions: function () {
    return {
      folderForEachSlug: true, // separate folder for each blog post, where index.md and post images will live
      imagePath: '/resources', // <img src="/images2/[filename]" >. Used in the markdown files.
      defaultCodeBlockLanguage: 'js', // code fenced by default will be ``` with no lang. If most of your code blocks are in a specific lang, set this here.
      imageStorageStrategy: 'LOCAL', // Where should be images be stored?
    };
  },
};
