export const appName = 'medmark';
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://brionmario.github.io/medmark';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'brionmario',
  repo: 'medmark',
  branch: 'main',
  // Docs live inside the website app, not at the repo root.
  docsPath: 'apps/website/content/docs',
};
