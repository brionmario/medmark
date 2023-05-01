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

/**
 * Type to specify the image storage strategy for a Medium post converted to markdown.
 */
export type MedmarkImageStorageStrategy = 'LOCAL' | 'REMOTE';

export interface MedmarkOptions {
  /**
   * Default language to use for code blocks.
   */
  defaultCodeBlockLanguage?: 'js' | string;
  /**
   * Whether to create a separate folder for each blog post.
   */
  folderForEachSlug?: boolean;
  /**
   * Path for images referenced in markdown files.
   */
  imagePath?: string;
  /**
   * Strategy to use for storing images.
   */
  imageStorageStrategy?: MedmarkImageStorageStrategy;
}
