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
  addPreAndCodeRule,
  addTitleRule,
  removeTags,
  registerPlugins,
  addParseCodeBlocksRule,
  addParseFigcaptionLinksRule,
} from './turndown';
import {MedMarkTemplateOptions} from './models';

// global placeholder allowing us to pass in options from the template...
let templateOptions: MedMarkTemplateOptions = {};

const turnDownOptions: TurndownService.Options = {
  /**
   * Code block style to use. Can be set to "indented" | "fenced".
   */
  codeBlockStyle: 'fenced',
};

const turndownService: TurndownService = new TurndownService(turnDownOptions);

// Register plugins
registerPlugins(turndownService, [gfm]);

// Removals.
removeTags(turndownService, ['style', 'script', 'meta', 'img']);

// Addition Rules.
addEmbeddedYoutubeRule(turndownService);
addEmbeddedTweetRule(turndownService);
addImageFigcaptionRule(turndownService);
addParseFigcaptionLinksRule(turndownService);
addParseCodeBlocksRule(turndownService, templateOptions);
addFencedLinkRule(turndownService);
addPreAndCodeRule(turndownService);
addTitleRule(turndownService);

// takes the code from the jobs page and turns it into markdown so we can show it on the posting page
// TODO: keep headings, lists, etc... everything else should be stripped
// No buttons, no links, no images...
function transformHtmlToMarkdown(code: string, templateOpts: MedMarkTemplateOptions): string {
  templateOptions = templateOpts;

  return turndownService.turndown(code);
}

export default transformHtmlToMarkdown;
