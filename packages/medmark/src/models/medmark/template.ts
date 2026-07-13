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
import {
  MedmarkRegistry,
  MedmarkRegistryContext,
  MedmarkRegistryEntry,
  MedmarkRegistryEntryContext,
  MedmarkRegistryFile,
} from './registry';

export interface MedmarkTemplate {
  /**
   * Builds the registry entry for a single generated post. Optional — when
   * omitted, Medmark uses its built-in default entry shape. Return `null` to
   * exclude the post from the registry.
   * @param post The render options for the post.
   * @param context Context about where the post was written.
   * @returns The registry entry, or `null` to skip.
   */
  buildRegistryEntry?(post: MedmarkTemplateRenderOptions, context: MedmarkRegistryEntryContext): MedmarkRegistryEntry | null;
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
  /**
   * Serializes the aggregated registry into one or more output files. Optional —
   * when omitted, Medmark uses its built-in serializers driven by
   * `options.registry.formats`.
   * @param registry The aggregated registry.
   * @param context Context about the run.
   * @returns The files to write, relative to the output root.
   */
  serializeRegistry?(registry: MedmarkRegistry, context: MedmarkRegistryContext): MedmarkRegistryFile[];
}

/**
 * Interface for the template render options object.
 */
export interface MedmarkTemplateRenderOptions extends Omit<MedmarkFrontMatter, 'images'> {
  /**
   * The body of the blog post.
   */
  body?: string;
  /**
   * The raw body of the blog post.
   */
  bodyRaw?: string;
  /**
   * The canonical URL of the post on the source provider (e.g. Medium).
   */
  canonicalUrl?: string;
  /**
   * Images associated with the blog post.
   */
  images?: MedmarkTemplateRenderOptionsImage[];
  /**
   * Published date of the blog post.
   */
  published?: string;
  /**
   * Sub title of the blog post.
   */
  subtitle?: string;
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
