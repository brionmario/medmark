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

import {program} from 'commander';
import inquirer from 'inquirer';
import convert from './converter';
import ConfigurationService from './configuration-service';
import output from './output';
import debug from './debug';

program
  .version('0.1.0')
  .description('Converts Medium exported archive to markdown')
  .option('-i, --input <path_to_posts_folder>', 'Path to the folder containing posts from the medium export')
  .option('-o, --output <destination_folder>', 'Destination folder for output files. Defaults to "output"')
  .option('-t, --template <template_file>', 'Template used to generate post files')
  .option('-d, --drafts', 'Set flag to export drafts along with other posts')
  .option('-s, --skip <comma_separated_files>', 'Comma-separated list of files to skip')
  .action(async () => {
    const {
      output: outputPath,
      input: inputPath,
      template: templatePath,
      drafts,
      skip,
      debug: debugMode,
    } = await inquirer.prompt([
      {
        message: 'Enter the path to the `posts` folder of the medium exported archive',
        name: 'input',
        type: 'input',
      },
      {
        default: 'output',
        message: 'Enter destination folder for output files (default is "./")',
        name: 'output',
        type: 'input',
      },
      {
        message: 'Enter the path to the template file',
        name: 'template',
        type: 'input',
      },
      {
        default: false,
        message: 'Do you want to export drafts as well?',
        name: 'drafts',
        type: 'confirm',
      },
      {
        message: 'Enter a comma-separated list of files to skip',
        name: 'skip',
        type: 'input',
      },
      {
        default: true,
        message: 'Do you want to run in debug mode?',
        name: 'debug',
        type: 'confirm',
      },
    ]);

    const toSkip: string[] = skip && skip.split(',');

    output.log({
      bodyLines: [
        `→ ⬇️ INPUT: ${inputPath}`,
        `→ ⬆️ OUTPUT (-o): ${outputPath}`,
        `→ 💅 TEMPLATE (-t): ${templatePath || 'none'}`,
        `→ ❌ TO SKIP (-s): ${toSkip || 'none'}`,
        `→ 🚧 SHOULD EXPORT DRAFTS? (-d): ${drafts}`,
      ],
      title: '💡 Following context has been initialized:',
    });

    const config: ConfigurationService = ConfigurationService.getInstance();

    if (debugMode) {
      config.setDebug(true);
      debug.initialize();
    }

    convert(inputPath, outputPath, templatePath, drafts, toSkip);
  })
  .parse(process.argv);

export * from './public-api';
