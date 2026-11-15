import type {MetadataRoute} from 'next';
import {siteUrl} from '@/site.config';

const base: string = siteUrl || 'http://localhost:3000';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{allow: '/', userAgent: '*'}],
    sitemap: `${base}/sitemap.xml`,
  };
}
