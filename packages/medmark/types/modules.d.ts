/**
 * Ambient type declarations for third-party packages that do not ship TypeScript definitions.
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
    stringify(obj: unknown): string;
    read(str: string): unknown;
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
    type: string;
    tagName: string;
    attribs: Record<string, string>;
    children: (Element & {data: string})[];
    parent: Element | null;
  }

  export type AnyNode = Element | {type: string; [key: string]: any};

  export interface Cheerio<T = Element> {
    [index: number]: T;
    length: number;
    each(fn: (this: any, index: number, element: T) => void): this;
    attr(name: string): string | undefined;
    attr(name: string, value: string): this;
    html(): string | null;
    html(html: string): this;
    text(): string;
    text(content: string): this;
    next(): Cheerio<T>;
    parent(): Cheerio<T>;
    remove(): this;
    replaceWith(content: Cheerio<any>): this;
    first(): this;
    map<R>(fn: (this: any, index: number, element: T) => R): Cheerio<R>;
  }

  export interface CheerioAPI {
    (selector: string | Element | any): Cheerio<Element>;
  }

  export function load(content: string | Buffer | any, options?: any): CheerioAPI;

  const cheerio: {load: typeof load};
  export default cheerio;
}
