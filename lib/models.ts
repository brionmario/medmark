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
 * MedMarkGlobal extends the Node.js global object to include additional properties for MedMark-specific global state.
 */
export interface MedMarkGlobal {
  /**
   * A boolean value indicating whether debugging mode is enabled or not.
   */
  debug: boolean;
  /**
   * A string value representing the timestamp at which the MedMark runner was started.
   */
  runnerTimestamp: string;
}

// Create an interface from below.
export interface MedMarkTemplateOptions {
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
  imageStorageStrategy?: 'REMOTE' | 'LOCAL';
}

/**
 * Enum to specify the image storage strategy for a Medium post converted to markdown.
 */
export enum MedMarkImageStorageStrategy {
  /**
   * Store images locally in the markdown file directory.
   */
  LOCAL = 'LOCAL',
  /**
   * Store images remotely, e.g. in a cloud storage service.
   */
  REMOTE = 'REMOTE',
}
