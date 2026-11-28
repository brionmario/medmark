#!/usr/bin/env node
/**
 * MIT License
 *
 * Copyright (c) 2026, Brion Mario
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
import resolveMediumExport, {normalisePathInput} from './export-resolver';
import {
  DEFAULT_MEDMARK_FOLDER_NAME,
  DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME,
  DEFAULT_MEDIUM_OUTPUT_FOLDER_NAME,
  DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME,
  DEFAULT_TEMPLATES_FOLDER_NAME,
} from './constants';

// The package manifest sits outside `rootDir`, so it is read at runtime rather than imported.
// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require
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

/**
 * Flags accepted by the `medmark` command. Every flag is optional; anything
 * omitted is prompted for interactively, unless the run is non-interactive
 * (see `yes`), in which case the default is used instead.
 */
interface MedmarkCliOptions {
  debug?: boolean;
  drafts?: boolean;
  input?: string;
  output?: string;
  skip?: string;
  template?: string;
  yes?: boolean;
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
  .option('-y, --yes', 'Skip all prompts and use the flags given, falling back to defaults')
  .action(async (options: MedmarkCliOptions) => {
    intro(BANNER);

    const cwd: string = process.cwd();
    const medmarkDir: string = path.join(cwd, DEFAULT_MEDMARK_FOLDER_NAME);

    // Prompts need a TTY to read keypresses from. When stdin is not one (CI, a
    // coding agent, a piped shell) asking would either hang or blow up in
    // `uv_tty_init`, so fall back to the flags plus defaults instead. `--yes`
    // forces the same path even when a TTY is present.
    const nonInteractive: boolean = options.yes === true || !process.stdin.isTTY;

    if (!fs.existsSync(medmarkDir)) {
      log.step(`No ${DEFAULT_MEDMARK_FOLDER_NAME}/ folder found, running first-time setup...`);
      await init();
    }

    const defaultInput: string = path.join(DEFAULT_MEDMARK_FOLDER_NAME, DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME);
    const defaultOutput: string = path.join(DEFAULT_MEDMARK_FOLDER_NAME, DEFAULT_MEDIUM_OUTPUT_FOLDER_NAME);

    const inputPath: string = nonInteractive
      ? options.input ?? defaultInput
      : options.input ??
        guardCancel(
          await text({
            defaultValue: defaultInput,
            message: 'Your Medium export (the .zip, or the folder you unzipped it to)',
            placeholder: defaultInput,
            validate(value: string): string | undefined {
              const resolved: string = path.resolve(cwd, value || defaultInput);
              if (!fs.existsSync(resolved)) {
                return `Path not found: ${resolved}`;
              }
              return undefined;
            },
          }),
        );

    // Whatever they pointed at, work out where the exported posts actually live:
    // the archive, the folder it unzips to, or the `posts` folder itself all work.
    // Failing here with a readable message beats failing deep inside the conversion.
    let postsPath: string = '';

    try {
      postsPath = resolveMediumExport(inputPath, cwd);
    } catch (e) {
      log.error((e as Error).message);
      process.exit(1);
    }

    const outputPath: string = nonInteractive
      ? options.output ?? defaultOutput
      : options.output ??
        guardCancel(
          await text({
            defaultValue: defaultOutput,
            message: 'Destination folder for output files',
            placeholder: defaultOutput,
          }),
        );

    let templatePath: string = options.template ?? '';
    let exportDrafts: boolean = options.drafts ?? false;
    let toSkip: string[] = [];
    let debugMode: boolean = options.debug ?? false;

    const configureAdvanced: boolean = nonInteractive
      ? false
      : guardCancel(
          await confirm({
            initialValue: false,
            message: 'Configure advanced options?',
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
          initialValue: false,
          message: 'Export drafts as well?',
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
          initialValue: false,
          message: 'Enable debug mode?',
        }),
      );
    }

    const resolvedTemplatePath: string | undefined = templatePath
      ? pathToFileURL(path.resolve(cwd, templatePath)).href
      : undefined;

    note(
      [
        `Input     ${postsPath}`,
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

    const s: ReturnType<typeof spinner> = spinner();
    s.start('Converting your Medium posts...');

    try {
      await convert(
        postsPath,
        path.resolve(cwd, normalisePathInput(outputPath)),
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
