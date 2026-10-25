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

/**
 * Output formats supported by the generated content registry.
 * - `json`    : a machine-readable `registry.json` manifest.
 * - `ts`      : a typed `registry.ts` ESM module (great DX for TS consumers).
 * - `rss`     : an RSS 2.0 `feed.xml` (requires `registry.site.url`).
 * - `sitemap` : a `sitemap.xml` (requires `registry.site.url`).
 */
export type MedmarkRegistryFormat = 'json' | 'ts' | 'rss' | 'sitemap';

/**
 * Configuration for the generated content registry.
 */
export interface MedmarkRegistryOptions {
  /**
   * Whether to generate a registry at all. Defaults to `true`.
   */
  enabled?: boolean;
  /**
   * Base filename (without extension) for the registry files. Defaults to `registry`.
   */
  filename?: string;
  /**
   * The formats to emit. Defaults to `['json']`.
   */
  formats?: MedmarkRegistryFormat[];
  /**
   * Whether to include drafts in the RSS/sitemap feeds. Drafts are always
   * present in the JSON/TS manifests (flagged via `draft: true`). Defaults to `false`.
   */
  includeDrafts?: boolean;
  /**
   * Site metadata, required for the `rss` and `sitemap` formats.
   */
  site?: {
    /**
     * A short description of the site, used in the RSS channel.
     */
    description?: string;
    /**
     * The language of the site (e.g. `en`), used in the RSS channel.
     */
    language?: string;
    /**
     * The title of the site, used in the RSS channel.
     */
    title?: string;
    /**
     * The absolute base URL of the site (e.g. `https://example.com`).
     * Required to emit `rss` and `sitemap`.
     */
    url?: string;
  };
}

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
  /**
   * Configuration for the generated content registry.
   */
  registry?: MedmarkRegistryOptions;
}
