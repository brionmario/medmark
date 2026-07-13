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

/**
 * Describes where a registry entry was originally sourced from.
 */
export interface MedmarkRegistrySource {
  /**
   * The provider the post was imported from (e.g. `medium`).
   */
  provider: string;
  /**
   * The canonical URL of the post on the source provider, if known.
   */
  url?: string;
}

/**
 * A single entry in the generated content registry. One entry maps to one
 * generated post file on disk.
 */
export interface MedmarkRegistryEntry {
  /**
   * Author display names associated with the post.
   */
  authors?: string[];
  /**
   * The URL for the banner/cover image of the post.
   */
  bannerImage?: string;
  /**
   * The categories associated with the post.
   */
  categories?: string[];
  /**
   * The publish date of the post (YYYY-MM-DD).
   */
  date?: string;
  /**
   * The description/summary of the post.
   */
  description?: string;
  /**
   * Whether the post is a draft.
   */
  draft?: boolean;
  /**
   * Path to the generated file, relative to the output root.
   */
  path: string;
  /**
   * The estimated reading time of the post.
   */
  readingTime?: string;
  /**
   * The slug of the post.
   */
  slug: string;
  /**
   * Where the post was originally sourced from.
   */
  source?: MedmarkRegistrySource;
  /**
   * The tags associated with the post.
   */
  tags?: string[];
  /**
   * The title of the post.
   */
  title: string;
}

/**
 * The aggregated registry payload written at the end of a conversion run.
 */
export interface MedmarkRegistry {
  /**
   * Total number of entries in the registry.
   */
  count: number;
  /**
   * ISO timestamp of when the registry was generated.
   */
  generatedAt?: string;
  /**
   * The tool + version that generated the registry (e.g. `medmark@0.2.5`).
   */
  generator: string;
  /**
   * The registry entries, one per generated post.
   */
  posts: MedmarkRegistryEntry[];
  /**
   * The schema version of this registry payload.
   */
  version: number;
}

/**
 * A file to be written to the output root as part of the registry output.
 */
export interface MedmarkRegistryFile {
  /**
   * The file contents.
   */
  content: string;
  /**
   * The filename (relative to the output root).
   */
  filename: string;
}

/**
 * Context passed to {@link MedmarkTemplate.buildRegistryEntry} for a single post.
 */
export interface MedmarkRegistryEntryContext {
  /**
   * The resolved template options for this run.
   */
  options: MedmarkOptions;
  /**
   * The output root directory of the run.
   */
  outputRoot: string;
  /**
   * Path to the generated file, relative to the output root.
   */
  relativePath: string;
  /**
   * The slug of the post.
   */
  slug: string;
}

/**
 * Context passed to {@link MedmarkTemplate.serializeRegistry} when the run finishes.
 */
export interface MedmarkRegistryContext {
  /**
   * The resolved template options for this run.
   */
  options: MedmarkOptions;
  /**
   * The output root directory of the run.
   */
  outputRoot: string;
}
