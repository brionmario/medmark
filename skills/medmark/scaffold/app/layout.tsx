import type {Metadata, Viewport} from 'next';
import {Inter, Instrument_Serif} from 'next/font/google';
import type {ReactNode} from 'react';
import site, {siteUrl} from '@/site.config';
import SiteFooter from './components/site-footer';
import SiteHeader from './components/site-header';
import {themeCss, themes} from './themes';
import './globals.css';

const body = Inter({display: 'swap', subsets: ['latin'], variable: '--font-body'});
const display = Instrument_Serif({display: 'swap', subsets: ['latin'], variable: '--font-display', weight: '400'});

export const metadata: Metadata = {
  ...(siteUrl ? {metadataBase: new URL(siteUrl)} : {}),
  alternates: {types: {'application/rss+xml': '/rss.xml'}},
  authors: [{name: site.name}],
  creator: site.name,
  description: site.description,
  icons: {icon: '/favicon.svg'},
  openGraph: {
    description: site.description,
    siteName: site.name,
    title: `${site.name}${site.tagline ? ` · ${site.tagline}` : ''}`,
    type: 'website',
  },
  title: {
    default: `${site.name}${site.tagline ? ` · ${site.tagline}` : ''}`,
    template: `%s · ${site.name}`,
  },
  twitter: {card: 'summary_large_image'},
};

export const viewport: Viewport = {
  themeColor: [
    {color: themes[site.theme].light.paper, media: '(prefers-color-scheme: light)'},
    {color: themes[site.theme].dark.paper, media: '(prefers-color-scheme: dark)'},
  ],
};

/**
 * Applies the saved theme before first paint, so there is no flash of the wrong
 * colours. Runs before React hydrates, which is why it is an inline script.
 */
const themeScript = `try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}`;

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* The chosen palette, from app/themes.ts. */}
        <style dangerouslySetInnerHTML={{__html: themeCss(site.theme)}} />
        <script dangerouslySetInnerHTML={{__html: themeScript}} />
      </head>
      <body className={`${body.variable} ${display.variable} min-h-screen flex flex-col`}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-[46rem] flex-1 px-5 pb-20">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
