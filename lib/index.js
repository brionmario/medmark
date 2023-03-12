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

const meow = require('meow');
const press = require('./press');

/**
 * Local libs
 */
const converter = require('./converter');
const debug = require('./debug');

const cli = meow(
  `
	Usage
	  $ medium2gatsby <src_file_or_folder>

	Options
      --output, -o Destination folder for output files. Defaults to './'.
      --template, -t Template used to generate post files.
      --drafts, -d set flag to export drafts along with other posts. Default, false.
	  --help, -h Shows usage instructions

	Examples
	  $ medium2gatsby . -o posts -t template.js
      $ medium2gatsby 2018-04-02_Introducing-the-react-testing-library----e3a274307e65.html -o output -t template.js

`,
  {
    flags: {
      drafts: {
        alias: 'd',
        default: false,
        type: 'boolean',
      },
      output: {
        alias: 'o',
        type: 'string',
      },
      skip: {
        alias: 's',
        type: 'string',
      },
      template: {
        alias: 't',
        type: 'string',
      },
    },
  },
);

/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

// show help if no args passed
if (cli.input.length < 1) {
  cli.showHelp();
}

const srcPath = cli.input[0];
const destPath = cli.flags.output;
const templatePath = cli.flags.template;
const exportDrafts = cli.flags.drafts;
const toSkip = cli.flags.skip && cli.flags.skip.split(',');

/* ====================================================================================== */
/* Execution starts from here                                                             */
/* ====================================================================================== */

press.print('=======================  💥 Welcome to Medium to md(x) converter 💥  =======================', true, true);

press.print('💡 Following context has been initialized:');
press.printItem(`⬇️ INPUT: ${srcPath}`, true);
press.printItem(`⬆️ OUTPUT (-o): ${destPath}`);
press.printItem(`💅 TEMPLATE (-t): ${templatePath}`);
press.printItem(`❌ TO SKIP (-s): ${toSkip}`);
press.printItem(`🚧 SHOULD EXPORT DRAFTS? (-d): ${exportDrafts}`);

converter.convert(srcPath, destPath, templatePath, exportDrafts);
// foo(cli.input[0], cli.flags);
debug.init();
