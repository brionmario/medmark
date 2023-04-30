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

/**
 * Interface for the front matter object.
 */
export interface MedMarkTemplateFrontMatter {
  /**
   * The authors of the blog post.
   */
  authors?: string[];
  /**
   * The URL for the banner image of the blog post.
   */
  bannerImage?: string;
  /**
   * The categories associated with the blog post.
   */
  categories?: string[];
  /**
   * The date the blog post was published.
   */
  date: string;
  /**
   * The description of the blog post.
   */
  description?: string;
  /**
   * Indicates whether the blog post is a draft.
   */
  draft?: boolean;
  /**
   * The URLs for all the images in the blog post.
   */
  images?: string[];
  /**
   * The URL for the Open Graph image of the blog post.
   */
  ogImage?: string;
  /**
   * The estimated reading time of the blog post in minutes.
   */
  readingTime?: number;
  /**
   * The slug for the blog post.
   */
  slug: string;
  /**
   * The tags associated with the blog post.
   */
  tags?: string[];
  /**
   * The title of the blog post.
   */
  title: string;
}

/**
 * Interface for the template render options object.
 */
export interface MedMarkTemplateRenderOptions {
  /**
   * The authors of the blog post.
   */
  authors?: string[];
  /**
   * THe body of the blog post.
   */
  body?: string;
  /**
   * The categories associated with the blog post.
   */
  categories?: string[];
  /**
   * The description of the blog post.
   */
  description?: string;
  /**
   * Indicates whether the blog post is a draft.
   */
  draft?: boolean;
  /**
   * Images associated with the blog post.
   */
  images?: MedMarkTemplateRenderOptionsImage[];
  /**
   * Published date of the blog post.
   */
  published?: string;
  /**
   * The estimated reading time of the blog post in minutes.
   */
  readingTime?: number;
  /**
   * The tags associated with the blog post.
   */
  tags?: string[];
  /**
   * The title of the blog post.
   */
  title: string;
  /**
   * The title of the blog post for the slug.
   */
  titleForSlug?: string;
}

/**
 * Interface for the template render options object.
 */
export interface MedMarkTemplateRenderOptionsImage {
  /**
   * The URL for the image.
   */
  mediumUrl: string;
}

/**
 * Represents the author information in the front matter of a Medmark document.
 */
export interface MedmarkFrontMatterAuthor {
  /**
   * The author's bio.
   */
  bio: string;
  /**
   * The author's unique identifier.
   */
  id: string;
  /**
   * The URL or path to the author's profile image.
   */
  image: string;
  /**
   * The author's name.
   */
  name: string;
  /**
   * The author's Twitter screen name.
   */
  twitterScreenName: string;
  /**
   * The author's username.
   */
  username: string;
}
