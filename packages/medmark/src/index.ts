#!/usr/bin/env node
/// <reference path="../types/modules.d.ts" />
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

import {Command} from 'commander';
import {cancel, confirm, intro, isCancel, log, note, outro, spinner, text} from '@clack/prompts';
import path from 'path';
import {pathToFileURL} from 'url';
import fs from 'fs';
import convert from './converter';
import ConfigurationService from './configuration-service';
import debug from './debug';
import init from './init';
import {
  DEFAULT_MEDMARK_FOLDER_NAME,
  DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME,
  DEFAULT_MEDIUM_OUTPUT_FOLDER_NAME,
  DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME,
  DEFAULT_TEMPLATES_FOLDER_NAME,
  MEDIUM_EXPORT_POSTS_FOLDER_NAME,
} from './constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {version: PKG_VERSION}: {version: string} = require(path.join(__dirname, '../../package.json'));

const BANNER: string = `
  ███╗   ███╗███████╗██████╗ ███╗   ███╗ █████╗ ██████╗ ██╗  ██╗
  ████╗ ████║██╔════╝██╔══██╗████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝
  ██╔████╔██║█████╗  ██║  ██║██╔████╔██║███████║██████╔╝█████╔╝
  ██║╚██╔╝██║██╔══╝  ██║  ██║██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗
  ██║ ╚═╝ ██║███████╗██████╔╝██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗
  ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝

       Convert your Medium export to Markdown  ·  v${PKG_VERSION}`;

function guardCancel<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return value as T;
}

const program: Command = new Command();

program
  .version(PKG_VERSION)
  .description('Converts Medium exported archive to markdown')
  .option('-i, --input <path>', 'Path to the posts folder from the medium export')
  .option('-o, --output <path>', 'Destination folder for output files')
  .option('-t, --template <file>', 'Template used to generate post files')
  .option('-d, --drafts', 'Export drafts along with other posts')
  .option('-s, --skip <files>', 'Comma-separated list of files to skip')
  .option('-D, --debug', 'Run in debug mode')
  .action(async options => {
    intro(BANNER);

    const cwd: string = process.cwd();
    const medmarkDir: string = path.join(cwd, DEFAULT_MEDMARK_FOLDER_NAME);

    if (!fs.existsSync(medmarkDir)) {
      log.step(`No ${DEFAULT_MEDMARK_FOLDER_NAME}/ folder found — running first-time setup...`);
      await init();
    }

    const defaultInput: string = path.join(
      DEFAULT_MEDMARK_FOLDER_NAME,
      DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME,
      MEDIUM_EXPORT_POSTS_FOLDER_NAME,
    );
    const defaultOutput: string = path.join(DEFAULT_MEDMARK_FOLDER_NAME, DEFAULT_MEDIUM_OUTPUT_FOLDER_NAME);

    const inputPath: string =
      options.input ??
      guardCancel(
        await text({
          message: 'Path to the `posts` folder of your Medium export',
          placeholder: defaultInput,
          defaultValue: defaultInput,
          validate(value: string): string | undefined {
            const resolved: string = path.resolve(cwd, value || defaultInput);
            if (!fs.existsSync(resolved)) {
              return `Path not found: ${resolved}`;
            }
            return undefined;
          },
        }),
      );

    const outputPath: string =
      options.output ??
      guardCancel(
        await text({
          message: 'Destination folder for output files',
          placeholder: defaultOutput,
          defaultValue: defaultOutput,
        }),
      );

    let templatePath: string = options.template ?? '';
    let exportDrafts: boolean = options.drafts ?? false;
    let toSkip: string[] = [];
    let debugMode: boolean = options.debug ?? false;

    const configureAdvanced: boolean = guardCancel(
      await confirm({
        message: 'Configure advanced options?',
        initialValue: false,
      }),
    );

    if (configureAdvanced) {
      const defaultTemplatePath: string = path.join(
        DEFAULT_MEDMARK_FOLDER_NAME,
        DEFAULT_TEMPLATES_FOLDER_NAME,
        DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME,
      );

      const templateInput: string = guardCancel(
        await text({
          message: 'Path to a custom template file (leave empty to use the built-in default)',
          placeholder: defaultTemplatePath,
        }),
      );
      templatePath = templateInput || '';

      exportDrafts = guardCancel(
        await confirm({
          message: 'Export drafts as well?',
          initialValue: false,
        }),
      );

      const skipInput: string = guardCancel(
        await text({
          message: 'Comma-separated list of files to skip (leave empty to skip none)',
          placeholder: 'e.g. draft_post.html, another.html',
        }),
      );
      if (skipInput) {
        toSkip = skipInput
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      debugMode = guardCancel(
        await confirm({
          message: 'Enable debug mode?',
          initialValue: false,
        }),
      );
    }

    const resolvedTemplatePath: string | undefined = templatePath
      ? pathToFileURL(path.resolve(cwd, templatePath)).href
      : undefined;

    note(
      [
        `Input     ${inputPath}`,
        `Output    ${outputPath}`,
        `Template  ${resolvedTemplatePath || 'built-in default'}`,
        `Drafts    ${exportDrafts ? 'yes' : 'no'}`,
        `Skip      ${toSkip.length ? toSkip.join(', ') : 'none'}`,
        `Debug     ${debugMode ? 'yes' : 'no'}`,
      ].join('\n'),
      'Configuration',
    );

    if (debugMode) {
      const config: ConfigurationService = ConfigurationService.getInstance();
      config.setDebug(true);
      debug.initialize();
    }

    const s = spinner();
    s.start('Converting your Medium posts...');

    try {
      await convert(
        path.resolve(cwd, inputPath),
        path.resolve(cwd, outputPath),
        resolvedTemplatePath,
        exportDrafts,
        toSkip,
      );
      s.stop('Conversion complete!');
      outro('Your posts have been converted. Happy writing!');
    } catch (e) {
      s.stop('Conversion failed.');
      log.error(`Error: ${(e as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize medmark in the current directory')
  .action(async () => {
    intro(BANNER);
    await init();
    outro('Initialization complete! Run `medmark` to start converting.');
  });

program.parse(process.argv);

export * from './public-api';
