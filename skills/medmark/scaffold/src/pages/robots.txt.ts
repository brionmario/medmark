import type {APIRoute} from 'astro';

export const GET: APIRoute = ({site}) => {
  const sitemap: string = site ? `Sitemap: ${new URL('sitemap.xml', site).href}\n` : '';

  return new Response(`User-agent: *\nAllow: /\n\n${sitemap}`, {headers: {'Content-Type': 'text/plain'}});
};
