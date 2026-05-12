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

const {execSync} = require('child_process');
const commonjs = require('@rollup/plugin-commonjs');
const copy = require('rollup-plugin-copy');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');
const json = require('@rollup/plugin-json');
const typescript = require('@rollup/plugin-typescript');
const shebang = require('rollup-plugin-preserve-shebang');
const dts = require('rollup-plugin-dts');
const pkg = require('./package.json');

/** Emits .d.ts files via tsc after the JS bundle is written, before the dts-bundle step runs. */
function emitDeclarations() {
  return {
    name: 'emit-declarations',
    closeBundle() {
      try {
        execSync('tsc -p tsconfig.lib.json --emitDeclarationOnly --noEmit false', {stdio: 'inherit'});
      } catch {
        // tsc exits non-zero when type errors exist, but still emits declarations
        // (noEmitOnError defaults to false). Warnings are already printed to stderr above.
      }
    },
  };
}

module.exports = [
  {
    cache: false,
    external: [
      // Node.js built-ins
      'fs', 'path', 'url', 'os', 'stream', 'util', 'events', 'buffer', 'crypto', 'http', 'https', 'module',
      // All npm dependencies — resolved from node_modules at runtime so transitive deps are always accessible
      ...Object.keys(pkg.dependencies || {}),
    ],
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        inlineDynamicImports: true,
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'esm',
        inlineDynamicImports: true,
        sourcemap: true,
      },
    ],
    plugins: [
      shebang(),
      json(),
      nodeResolve({
        exportConditions: ['node'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.lib.json',
        declaration: false,
        declarationDir: undefined,
      }),
      terser(),
      emitDeclarations(),
      copy({
        targets: [
          {dest: 'dist', src: '../README.md'},
          {dest: 'dist', src: '../LICENSE'},
        ],
      }),
    ],
  },
  {
    cache: false,
    external: [/\.s?css$/],
    input: 'dist/types/index.d.ts',
    output: [{file: 'dist/index.d.ts', format: 'esm'}],
    plugins: [dts.default()],
  },
];
