import type {NextConfig} from 'next';

/**
 * The blog is a fully static site: `npm run build` writes plain HTML to `out/`,
 * which any host will serve. Nothing here needs a Node server at runtime.
 */
const nextConfig: NextConfig = {
  output: 'export',
  // Static export has no image optimiser, and posts converted from Medium
  // point at Medium's CDN, so images are served as-is.
  images: {unoptimized: true},
  // Pretty URLs: /posts/my-post/ instead of /posts/my-post.html.
  trailingSlash: true,
};

export default nextConfig;
