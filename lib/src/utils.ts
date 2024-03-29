/**
 * MIT License
 *
 * Copyright (c) 2023, Brion Mario.
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

import fs from 'fs-extra';
import {basename, join, resolve} from 'path';
import YAML from 'json-to-pretty-yaml';
import {MediumApolloState, MediumPostMetadata} from './models/medium';
import {MedmarkFrontMatter, MedmarkFrontMatterAuthor} from './models/medmark/front-matter';

/**
 * Scrape tags from the Apollo state from scraped metadata.
 *
 * Apollo state object has tabs in the following format.
 * And this function will extract them.
 * {
 *    "Tag:SOME_TAG": {
 *      ...
 *    }
 * }
 *
 * @param apolloState - Apollo state from scraped Medium Page.
 * @returns Set of tags as string arrays.
 */
export const getTags = (apolloState: MediumApolloState): string[] => {
  const tags: string[] = [];

  Object.keys(apolloState).forEach((key: string) => {
    if (key.startsWith('Tag:')) {
      tags.push(key.split(':')[1]);
    }
  });

  return tags;
};

/**
 * Extracts the Authors info from scraped metadata.
 *
 * @remarks Medium currently doesn't support multiple authors.
 * Hence this function currently outputs only one author.
 *
 * @param apolloState - Apollo state from scraped Medium Page.
 * @param metadata - Metadata scraped Medium Page.
 * @returns Set of authors as an array.
 */
export const getAuthors = (
  apolloState: MediumApolloState,
  metadata: MediumPostMetadata,
): MedmarkFrontMatterAuthor[] => {
  let author: MedmarkFrontMatterAuthor = null;
  const authorNameFromMeta: string = metadata?.author?.name;

  // FIXME: TS ISSUE
  Object.entries(apolloState).forEach(([key, value]: any) => {
    if (key.startsWith('User:') && value.name === authorNameFromMeta) {
      author = {
        bio: value.bio,
        id: value.id,
        image: `https://miro.medium.com/fit/c/176/176/${value.imageId}`,
        name: value.name,
        twitterScreenName: value.twitterScreenName,
        username: value.username,
      };
    }
  });

  return [author];
};

/**
 * Converts a text to a slug.
 *
 * @param text - Text to convert.
 * @returns Slug.
 */
export const convertToSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');

/**
 * Writes the post to a file.
 *
 * FIXME: get name from date + slug
 * @param content
 * @param oldFilePath
 * @param outputFolder
 */
export const writePostToFile = (content: string, oldFilePath: string, outputFolder: string): void => {
  const fileName: string = basename(oldFilePath, '.html');
  const newPath: string = resolve(`${join(outputFolder, fileName)}.md`);

  fs.writeFileSync(newPath, content);
};

/**
 * Converts front matter JSON to YAML.
 *
 * @param frontMatter - Front matter object to convert.
 * @returns Front matter as YAML.
 */
export function frontMatterToYaml(frontMatter: MedmarkFrontMatter): string {
  return YAML.stringify(frontMatter);
}
