const commonjs = require('@rollup/plugin-commonjs');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');
const json = require('@rollup/plugin-json');
const typescript = require('@rollup/plugin-typescript');
const shebang = require('rollup-plugin-preserve-shebang');
const pkg = require('./package.json');
const dts = require('rollup-plugin-dts');

module.exports = [
  {
    cache: false,
    input: 'lib/index.ts',
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
      }),
      //terser(),
    ],
    //external: ['fs', 'path'],
  },
  {
    cache: false,
    external: [/\.s?css$/],
    input: 'dist/esm/types/index.d.ts',
    output: [{file: 'dist/index.d.ts', format: 'esm'}],
    plugins: [dts.default()],
  },
];
