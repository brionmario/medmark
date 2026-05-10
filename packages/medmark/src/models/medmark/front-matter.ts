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

/**
 * Interface for the front matter object.
 */
export interface MedmarkFrontMatter {
  /**
   * The authors of the blog post.
   */
  authors?: MedmarkFrontMatterAuthor[];
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
  date?: string;
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
  readingTime?: string;
  /**
   * The slug for the blog post.
   */
  slug?: string;
  /**
   * The tags associated with the blog post.
   */
  tags?: string[];
  /**
   * The title of the blog post.
   */
  title: string;
}
