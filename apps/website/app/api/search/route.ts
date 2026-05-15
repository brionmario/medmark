import {source} from '@/lib/source';
import {createFromSource} from 'fumadocs-core/search/server';

const {GET: dynamicGET, staticGET} = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});

// Static export requires force-static and the full index served at build time.
// The oramaStaticClient then performs search client-side against the pre-built index.
export const dynamic = process.env.NEXT_EXPORT === 'true' ? 'force-static' : 'auto';

export const GET = process.env.NEXT_EXPORT === 'true' ? staticGET : dynamicGET;
