#!/usr/bin/env node
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

const {program} = require('commander');
const press = require('./press');
const converter = require('./converter');
const debug = require('./debug');

program
  .version('0.1.0')
  .description('Converts Medium exported archive to markdown')
  .arguments('<src_file_or_folder>')
  .option('-o, --output <destination_folder>', 'Destination folder for output files. Defaults to "./"')
  .option('-t, --template <template_file>', 'Template used to generate post files')
  .option('-d, --drafts', 'Set flag to export drafts along with other posts')
  .option('-s, --skip <comma_separated_files>', 'Comma-separated list of files to skip')
  .action(srcPath => {
    const destPath = program.opts().output || './';
    const templatePath = program.opts().template;
    const exportDrafts = program.opts().drafts;
    const toSkip = program.opts().skip && program.opts().skip.split(',');

    /* ====================================================================================== */
    /* Execution starts from here                                                             */
    /* ====================================================================================== */

    press.print(
      '=======================  💥 Welcome to Medium to md(x) converter 💥  =======================',
      true,
      true,
    );

    press.print('💡 Following context has been initialized:');
    press.printItem(`⬇️ INPUT: ${srcPath}`, true);
    press.printItem(`⬆️ OUTPUT (-o): ${destPath}`);
    press.printItem(`💅 TEMPLATE (-t): ${templatePath}`);
    press.printItem(`❌ TO SKIP (-s): ${toSkip}`);
    press.printItem(`🚧 SHOULD EXPORT DRAFTS? (-d): ${exportDrafts}`);

    converter.convert(srcPath, destPath, templatePath, exportDrafts, toSkip);
    debug.init();
  })
  .parse(process.argv);
