import {source} from '@/lib/source';
import {createFromSource} from 'fumadocs-core/search/server';

// Serve the full orama index as a static JSON file so the oramaStaticClient
// can do client-side search without a running server (required for static export).
export const dynamic = 'force-static';

const server = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});

export const GET = server.staticGET;
