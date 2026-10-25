/**
 * MIT License
 *
 * Copyright (c) 2026, Brion Mario
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

declare module 'fake-useragent' {
  function fakeUa(): string;
  export default fakeUa;
}

declare module 'turndown-plugin-gfm' {
  import TurndownService from 'turndown';

  type Plugin = (service: TurndownService) => void;
  export const gfm: Plugin;
  export const tables: Plugin;
  export const strikethrough: Plugin;
  export const taskListItems: Plugin;
}

declare module 'json-to-pretty-yaml' {
  interface YAMLLib {
    read(str: string): unknown;
    stringify(obj: unknown): string;
  }
  const YAML: YAMLLib;
  export default YAML;
}

// mkdirp 0.5.x does not ship TypeScript types.
declare module 'mkdirp' {
  function mkdirp(dir: string, opts?: any): Promise<string | undefined>;
  namespace mkdirp {
    function sync(dir: string, opts?: any): string | undefined;
  }
  export = mkdirp;
}

// fs-extra v11 ships types but moduleResolution:node does not resolve them via the exports field.
declare module 'fs-extra';

// cheerio 1.0.0-rc.2 does not ship TypeScript types; declare the API surface used by this package.
declare module 'cheerio' {
  export interface Element {
    attribs: Record<string, string>;
    children: (Element & {data: string})[];
    parent: Element | null;
    tagName: string;
    type: string;
  }

  export type AnyNode = Element | {[key: string]: any; type: string};

  export interface Cheerio<T = Element> {
    [index: number]: T;
    attr(name: string): string | undefined;
    attr(name: string, value: string): this;
    each(fn: (this: any, index: number, element: T) => void): this;
    first(): this;
    hasClass(className: string): boolean;
    html(html: string): this;
    html(): string | null;
    length: number;
    map<R>(fn: (this: any, index: number, element: T) => R): Cheerio<R>;
    next(): Cheerio<T>;
    parent(): Cheerio<T>;
    remove(): this;
    replaceWith(content: Cheerio<any>): this;
    text(content: string): this;
    text(): string;
  }

  export interface CheerioAPI {
    (selector: string | Element | any): Cheerio<Element>;
  }

  export function load(content: string | Buffer | any, options?: any): CheerioAPI;

  const cheerio: {load: typeof load};
  export default cheerio;
}
