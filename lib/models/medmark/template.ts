/**
 * MIT License
 *
 * Copyright (c) 2023, Brion Mario
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

import {MedmarkOptions} from './core';
import {MedmarkFrontMatter} from './front-matter';

export interface MedmarkTemplate {
  /**
   * Returns an object with default options for rendering markdown.
   * @returns Object containing default options.
   */
  getOptions(): MedmarkOptions;
  /**
   * Takes a data object and returns a string of front matter and markdown body.
   * @param data Data object containing blog post information.
   * @returns String containing front matter and markdown.
   */
  render(options: MedmarkTemplateRenderOptions): string;
}

/**
 * Interface for the template render options object.
 */
export interface MedmarkTemplateRenderOptions extends Omit<MedmarkFrontMatter, 'images'> {
  /**
   * THe body of the blog post.
   */
  body?: string;
  /**
   * Images associated with the blog post.
   */
  images?: MedmarkTemplateRenderOptionsImage[];
  /**
   * Published date of the blog post.
   */
  published?: string;
  /**
   * The title of the blog post for the slug.
   */
  titleForSlug?: string;
}

/**
 * Interface for the template render options object.
 */
export interface MedmarkTemplateRenderOptionsImage {
  /**
   * The local name of the image.
   */
  localName?: string;
  /**
   * The local path of the image.
   */
  localPath?: string;
  /**
   * The URL for the image.
   */
  mediumUrl: string;
}
