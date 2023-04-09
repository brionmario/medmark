/**
 * MIT License
 *
 * Copyright (c) 2023, Brion Mario.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {extname} from 'path';
import fetch, {Response} from 'node-fetch';
import MedmarkSilentException from './exceptions/medmark-silent-exception';

/**
 * Get the raw gist from GitHub.
 *
 * @param gistUrl - URL of the gist.
 * @returns Promise containing the raw gist text.
 * @throws MedmarkSilentException if the request fails.
 */
async function getRawGist(gistUrl: string): Promise<string> {
  let url: string = gistUrl.replace('github.com', 'githubusercontent.com');

  // Remove suffix (like .js) (maybe use it for code fencing later...)
  // FIXME: This is hacky
  const gistID: string = url.split('/')[4]; // FIXME: Guard for error

  if (gistID.includes('.')) {
    const ext: string = extname(gistID);
    url = url.replace(ext, ''); // Strip extension (needed for raw fetch to work)
  }

  url = `${url}/raw`;

  const response: Response = await fetch(url);

  if (!response.ok) {
    throw new MedmarkSilentException(`An error occurred while getting the Gist: ${response.statusText}`);
  }

  return response.text();
}

/**
 * Attempts to take gist script tags, then downloads the raw content, and places in <pre> tag which will be converted to
 * fenced block (```) by Turndown.
 *
 * @param document - Document.
 * @param reporter - The reporter object.
 * @returns Promise containing an array of resolved Promises.
 */
export async function inlineGists(document: any, reporter: any): Promise<void[]> {
  // Get all script tags on the page
  // FIXME: Can do away with promises here entirely?
  const promises: Array<Promise<void>> = [];

  document('script').each(async function () {
    const gistPromise: Promise<void> = new Promise<void>(
      async (resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => {
        const src: string = document(this).attr('src') || '';
        const isGist: boolean = src.includes('gist');

        if (isGist) {
          try {
            // console.log('Fetching raw gist source for: ', src);
            reporter.report.gists.attempted.push(src);
            const rawGist: string = await getRawGist(src);
            reporter.report.gists.succeeded.push(src);

            // Replace rawGist in markup.  This turns into ``` codefence.
            // FIXME: Just modify this in Turndown?
            const inlineCode: string = document(`<pre>${rawGist}</pre>`);

            // FIXME: Guard to ensure <figure> parent is removed
            // Replace the <figure> parent node with code fence
            document(this).parent().replaceWith(inlineCode);

            resolve();
          } catch (e) {
            reporter.report.gists.failed.push(src);
            reject(e);
          }
        }

        // FIXME: If this is not a Gist, resolve(). Else the operation will hang if there are no Gists in the post.
        resolve();
      },
    );

    promises.push(gistPromise);
  });

  return Promise.all(promises);
}
