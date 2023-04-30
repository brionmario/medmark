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

import YAML from 'json-to-pretty-yaml';
import {
  MedMarkTemplateOptions,
  MedMarkTemplateFrontMatter,
  MedMarkTemplateRenderOptions,
  MedMarkTemplateRenderOptionsImage,
} from '../models/medmark';

export default {
  /**
   * Returns an object with default options for rendering markdown.
   * @returns Object containing default options.
   */
  getOptions(): MedMarkTemplateOptions {
    return {
      defaultCodeBlockLanguage: 'js',
      folderForEachSlug: true,
      imagePath: '/resources',
      imageStorageStrategy: 'REMOTE',
    };
  },
  /**
   * Takes a data object and returns a string of front matter and markdown body.
   * @param data Data object containing blog post information.
   * @returns String containing front matter and markdown.
   */
  render({
    published,
    titleForSlug,
    title,
    description,
    authors,
    readingTime,
    draft,
    categories,
    tags,
    images,
    body,
  }: MedMarkTemplateRenderOptions): string {
    const date: Date = new Date(published);
    const prettyDate: string = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;

    const {mediumUrl: bannerImage = '', mediumUrl: ogImage = ''} = images[0] ?? {};

    /* eslint-disable sort-keys */
    const frontMatterAsJSON: MedMarkTemplateFrontMatter = {
      slug: `/posts/${titleForSlug}/`,
      date: prettyDate,
      title,
      description,
      authors,
      readingTime,
      draft,
      categories,
      tags,
      bannerImage,
      ogImage,
      images: images.map((image: MedMarkTemplateRenderOptionsImage) => image.mediumUrl),
    };
    /* eslint-enable sort-keys */

    const frontMatter: string = `\
---
${YAML.stringify(frontMatterAsJSON)}
---

${body}
`;

    return frontMatter;
  },
};
