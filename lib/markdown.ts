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

import TurndownService from 'turndown';
import {gfm} from 'turndown-plugin-gfm';
import {
  addEmbeddedTweetRule,
  addEmbeddedYoutubeRule,
  addFencedLinkRule,
  addImageFigcaptionRule,
  addParseCodeBlocksRule,
  addParseFigcaptionLinksRule,
  addPreAndCodeRule,
  addTitleRule,
  removeTags,
  registerPlugins,
} from './turndown';
import {MedMarkTemplateOptions} from './models/medmark';

const turnDownOptions: TurndownService.Options = {
  codeBlockStyle: 'fenced',
};

/**
 * Creates a new TurndownService instance with the default plugins and options.
 * @param plugins - Additional Turndown plugins to use.
 * @param options - Additional options to pass to the template.
 * @returns The TurndownService instance.
 */
function createTurndownService(plugins: TurndownService.Plugin[], options: MedMarkTemplateOptions): TurndownService {
  const turndownService: TurndownService = new TurndownService(turnDownOptions);

  registerPlugins(turndownService, plugins);
  removeTags(turndownService, ['style', 'script', 'meta', 'img']);
  addEmbeddedYoutubeRule(turndownService);
  addEmbeddedTweetRule(turndownService);
  addImageFigcaptionRule(turndownService);
  addParseFigcaptionLinksRule(turndownService);
  addParseCodeBlocksRule(turndownService, options);
  addFencedLinkRule(turndownService);
  addPreAndCodeRule(turndownService);
  addTitleRule(turndownService);
  return turndownService;
}

/**
 * Transforms the input HTML code into Markdown.
 * @param code - The HTML code to transform.
 * @param options - Additional options to pass to the template.
 * @param plugins - Additional Turndown plugins to use.
 * @returns The transformed Markdown code.
 */
export function transformHtmlToMarkdown(
  code: string,
  options: MedMarkTemplateOptions = {},
  plugins: TurndownService.Plugin[] = [gfm],
): string {
  const turndownService: TurndownService = createTurndownService(plugins, options);

  return turndownService.turndown(code);
}
