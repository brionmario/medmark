import showcase from '@/content/showcase.json';

export interface ShowcaseAuthor {
  name: string;
  github?: string;
}

export interface ShowcaseSite {
  name: string;
  url: string;
  description: string;
  author: ShowcaseAuthor;
  repo?: string;
  tags?: string[];
}

/**
 * Every showcase entry, sorted by name so the rendered order never depends on
 * where a contributor happened to insert their object.
 */
export function getShowcaseSites(): ShowcaseSite[] {
  return [...(showcase.sites as ShowcaseSite[])].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The hostname shown on a card, e.g. `brionmario.com`.
 */
export function getDisplayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
