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

const EMBEDDED_TWEET_HTML_SPIT_DELIMITER = 'EMBEDDED_TWEET_HTML_SPIT_DELIMITER';

// FIXME: Figure out a better way to identify replies.
const KNOWN_POSTS_TO_SKIP = [
  'Hi Rohan,',
  'IS is blocking CORS requests by default.',
  "Nice catch. I've fixed the typo. Thanks a lot 😀",
];

const ImageStorageStrategies = Object.freeze({
  LOCAL: 'LOCAL',
  REMOTE: 'REMOTE',
});

module.exports = {
  EMBEDDED_TWEET_HTML_SPIT_DELIMITER,
  ImageStorageStrategies,
  KNOWN_POSTS_TO_SKIP,
};