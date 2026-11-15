/**
 * Everything personal about this blog lives here.
 *
 * Fill it in once and the rest of the site follows: the header, the home page
 * introduction, the about page, meta tags, the RSS feed and the footer all read
 * from this file. Leave a field empty and the section that uses it disappears
 * rather than rendering a placeholder.
 */
export interface SiteLink {
  /** Shown as the link text, e.g. "GitHub", "LinkedIn", "Email". */
  label: string;
  /** Absolute URL, or `mailto:` for email. */
  href: string;
}

export interface WorkEntry {
  /** Job title, e.g. "Senior Software Engineer". */
  role: string;
  company: string;
  /** Free text, e.g. "2022 — now". */
  period: string;
  /** One line on what you did there. Optional. */
  summary?: string;
}

export interface SiteConfig {
  /** The person this blog belongs to. Used in the header and copyright. */
  name: string;
  /** What you do, e.g. "Software engineer". Shown under your name. */
  role: string;
  /** Optional, e.g. "Colombo, Sri Lanka". */
  location: string;
  /** One sentence on the home page, in your own voice. */
  tagline: string;
  /** Meta description and RSS channel description. */
  description: string;
  /** Your public URL once deployed, e.g. "https://ada.dev". No trailing slash. */
  url: string;
  /** Path to an image in `public/`, e.g. "/avatar.jpg". Empty hides the avatar. */
  avatar: string;
  /** One or more paragraphs for the about page. Empty array hides the page. */
  about: string[];
  /** What you are working on right now. One or two sentences, or empty. */
  now: string;
  /** Recent roles for the about page. Empty array hides the section. */
  work: WorkEntry[];
  /** Header navigation. `/about` is dropped automatically when `about` is empty. */
  nav: SiteLink[];
  /** Footer and about-page links. */
  links: SiteLink[];
}

export const site: SiteConfig = {
  name: 'Your Name',
  role: '',
  location: '',
  tagline: 'Writing about the things I build.',
  description: 'Essays and notes by Your Name.',
  url: '',
  avatar: '',
  about: [],
  now: '',
  work: [],
  nav: [
    {label: 'Writing', href: '/'},
    {label: 'About', href: '/about/'},
  ],
  links: [{label: 'RSS', href: '/rss.xml'}],
};

/** The canonical origin, falling back to the env var used by most hosts. */
export const siteUrl: string = (site.url || process.env.SITE_URL || '').replace(/\/+$/, '');

export default site;
