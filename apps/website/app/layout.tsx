import {RootProvider} from 'fumadocs-ui/provider/next';
import './global.css';
import {Inter} from 'next/font/google';
import type {Metadata} from 'next';
import {appName, siteUrl} from '@/lib/shared';

const inter = Inter({
  subsets: ['latin'],
});

// Needed so relative Open Graph / Twitter image URLs resolve to absolute ones.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: 'Export your Medium articles to Markdown (md) or MDX.',
};

export default function Layout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider search={{options: {type: 'static'}}}>{children}</RootProvider>
      </body>
    </html>
  );
}
