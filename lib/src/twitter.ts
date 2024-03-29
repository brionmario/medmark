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

import fetch, {Response} from 'node-fetch';
import {CheerioAPI} from 'cheerio';
import {EMBEDDED_TWEET_HTML_SPIT_DELIMITER} from './constants';

async function embedTweets($cheerio: CheerioAPI): Promise<void[]> {
  const promises: Promise<void>[] = [];

  $cheerio('blockquote.twitter-tweet a').each(function () {
    const promise: Promise<void> = new Promise<void>(async (resolve: (value: void | PromiseLike<void>) => void) => {
      const href: string = $cheerio(this).attr('href');

      // FIXME: TS ISSUE
      const embedded: any = await fetch(`https://publish.twitter.com/oembed?url=${href}`).then((response: Response) =>
        response.json(),
      );

      $cheerio(this).text(`${EMBEDDED_TWEET_HTML_SPIT_DELIMITER}${embedded.html}${EMBEDDED_TWEET_HTML_SPIT_DELIMITER}`);

      resolve();
    });

    promises.push(promise);
  });

  return Promise.all(promises);
}

export default embedTweets;
