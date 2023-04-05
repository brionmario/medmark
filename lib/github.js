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

import {extname}  from 'path';
import http from './http';
import MedmarkSilentException from './exceptions/medmark-silent-exception';

/**
 * Get the raw gist from github.
 */
export async function getRawGist(gistUrl) {
  let newUrl = gistUrl.replace('github.com', 'githubusercontent.com');

  // remove suffix (like .js) (maybe use it for code fencing later...)
  // FIXME: this is hacky
  const gistID = newUrl.split('/')[4]; // FIXME: guard for error
  if (gistID.includes('.')) {
    const ext = extname(gistID);
    newUrl = newUrl.replace(ext, ''); // srip extension (needed for raw fetch to work)
  }

  newUrl += '/raw';

  // make the call
  const resp = await http.get({url: newUrl});
  if (resp.statusCode === 200) {
    return resp.body;
  }

  throw MedmarkSilentException(`An error occured while getting the Gist: ${resp}`);
}

/**
 * Attempts to take gist script tags, then downloads the raw content, and places in <pre> tag which will be converted to
 * fenced block (```) by turndown
 *
 * @param {*} $ - Document.
 * @returns Gists.
 */
export async function inlineGists($, reporter) {
  // get all script tags on thet page
  // FIXME: can do away with promises here entirely?
  const promises = [];

  $('script').each(async function () {
    const prom = new Promise(async (resolve, reject) => {
      const src = $(this).attr('src');
      const isGist = src.includes('gist');

      if (isGist) {
        try {
          // console.log('feching raw gist source for: ', src);
          reporter.report.gists.attempted.push(src);
          const rawGist = await getRawGist(src);
          reporter.report.gists.succeeded.push(src);

          // replace rawGist in markup
          // FIXME: just modify this in turndown?
          const inlineCode = $(`<pre>${rawGist}</pre>`); // this turns into ``` codefence

          // FIXME: guard to ensure <figure> parent is removed
          // Replace the <figure> parent node with code fence
          $(this).parent().replaceWith(inlineCode);

          resolve();
        } catch (e) {
          reporter.report.gists.failed.push(src);
          reject(e);
        }
      }

      // FIXME: if this is not a Gist, resole(). Else the operation will hang if there are no Gists in the post.
      resolve();
    });

    promises.push(prom);
  });

  return Promise.all(promises);
}
