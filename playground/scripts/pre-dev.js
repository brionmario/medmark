#!/usr/bin/env node
/**
 * MIT License
 *
 * Copyright (c) 2023, Brion Mario
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

const path = require('path');
const fs = require('fs-extra');

const logger = {
  // eslint-disable-next-line no-console
  log: console.log,
  // eslint-disable-next-line no-console
  error: console.error,
};

/* ====================================================================================== */
/* Execution starts from here                                                             */
/* ====================================================================================== */

logger.log('⚠️ Checking for Medmark Posts');

if (!fs.existsSync(path.resolve(__dirname, path.join('..', '.medmark', 'output')))) {
  logger.log('No Medmark posts directory found (.medmark/output)');
  logger.log(
    'Run `pnpm medmark init` to initialize Medmark and then copy the posts from the medium archive to .medmark/medium-output',
  );
  process.exit(1);
}

logger.log('> Started copying Medmark Posts');

try {
  fs.copySync(
    path.resolve(__dirname, path.join('..', '.medmark', 'output')),
    path.resolve(__dirname, path.join('..', 'pages', 'blogs')),
    {overwrite: true},
  );

  logger.log('✅ Successfully copied Medmark Posts');
} catch (e) {
  logger.error('❌ Failed to copy Medmark Posts');
  logger.error(e);
  process.exit(1);
}
