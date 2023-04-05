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
import {fileURLToPath} from 'url';
import {dirname, join, resolve} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PATHS = {
  debug: join(resolve(__dirname), '..', 'debug'),
  samples: {
    apolloState: join(resolve(__dirname), '..', 'debug', 'samples', 'apollo-state.json'),
    metaData: join(resolve(__dirname), '..', 'debug', 'samples', 'meta.json'),
    root: join(resolve(__dirname), '..', 'debug', 'samples'),
  },
};

const DEBUG_CONTEXT_INITIAL_STATE = {
  samples: {
    apolloState: false,
  },
};

let debugContext = DEBUG_CONTEXT_INITIAL_STATE;

const enabled = () => {
  if (process.env.NODE_ENV === 'debug') {
    return true;
  }

  return false;
};

const init = () => {
  fs.mkdirpSync(PATHS.samples.root);
};

const getDebugContext = () => debugContext;

const setDebugContext = context => {
  debugContext = context;
};

const createSample = (key, content) => {
  if (debugContext.samples[key]) {
    return;
  }

  fs.writeFileSync(PATHS.samples[key], JSON.stringify(content, null, 2));
  debugContext.samples[key] = true;
};

export default {
  createSample,
  enabled,
  getDebugContext,
  init,
  setDebugContext,
};
