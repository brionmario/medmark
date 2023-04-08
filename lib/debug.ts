/**
 * MIT License
 *
 * Copyright (c) 2022, Brion Mario.
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

import fs from 'fs-extra';
import {dirname, join, resolve} from 'path';

const runnerTimestamp = new Date().toISOString();
const PATHS = {
  logs: {
    root: resolve(join('logs', runnerTimestamp)),
    files: {
      apolloState(articleId: string) {
        return resolve(join(PATHS.logs.root, articleId, 'apollo-state.json'));
      },
      metaData(articleId: string) {
        return resolve(join(PATHS.logs.root, articleId, 'meta.json'));
      },
    },
  },
};

function enabled() {
  return global.__MEDMARK__.debug;
}

function initialize() {
  fs.mkdirpSync(PATHS.logs.root);

  if (!global.__MEDMARK__) {
    global.__MEDMARK__ = {};
  }

  global.__MEDMARK__['debug'] = true;
  global.__MEDMARK__['runnerTimestamp'] = runnerTimestamp;
}

function saveLog(articleId: string, fileName: keyof typeof PATHS.logs.files, content: unknown) {
  if (!global?.__MEDMARK__?.debug) {
    return;
  }

  const filePath: string = PATHS.logs.files[fileName](articleId);

  fs.ensureDirSync(resolve(dirname(filePath)));
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

export default {
  saveLog,
  enabled,
  initialize,
};
