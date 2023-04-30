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

import fetch, {Response} from 'node-fetch';
import fakeUa from 'fake-useragent';
import request from 'request';
import fs, {WriteStream} from 'fs';
import cheerio from 'cheerio';
import mkdirp from 'mkdirp';
import {join, resolve, basename, extname} from 'path';
import Module from 'module';
import output from './output';
import {transformHtmlToMarkdown} from './markdown';
import Reporter from './reporter';
import debug from './debug';
import embedTweets from './twitter';
import {convertToSlug, writePostToFile, getAuthors, getTags} from './utils';
import MedmarkException from './exceptions/medmark-exception';
import MedmarkSilentException from './exceptions/medmark-silent-exception';
import {inlineGists} from './github';
import logger from './logger';
import DefaultTemplate from './templates/default';
import {MedmarkImageStorageStrategy, MedmarkOptions, MedmarkParsedDocument} from './models/medmark/core';
import {
  MedmarkTemplate,
  MedmarkTemplateRenderOptions,
  MedmarkTemplateRenderOptionsImage,
} from './models/medmark/template';

const reporter: Reporter = Reporter.getInstance();

// handle promise errors
process.on('unhandledRejection', (error: string) => {
  logger.error(error);
});

/**
 * Retrieves the meta details of a webpage from the given URL.
 * FIXME: add error handling conditions..
 *
 * @param url The URL of the webpage to scrape.
 * @returns A promise that resolves with the HTML text of the response.
 * @throws {TypeError} If `url` is not a string.
 * @throws {Error} If there is an issue with the fetch request.
 */
async function scrapeMetaDetailsFromPost(url: string): Promise<string> {
  const response: Response = await fetch(url, {
    headers: {
      'User-Agent': fakeUa(),
    },
  });

  return response.text();
}

async function saveImagesToLocal(folderPath: string, images: MedmarkTemplateRenderOptionsImage[]): Promise<any> {
  const imagePromises: Promise<void>[] = images.map(
    (image: MedmarkTemplateRenderOptionsImage) =>
      new Promise((_resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => {
        const filePath: string = join(folderPath, image.localName);
        mkdirp.sync(folderPath);

        logger.info(`Downloading image : ${image.mediumUrl} -> ${filePath}`);
        reporter.report.images.attempted.push(image.mediumUrl);

        const writer: WriteStream = fs.createWriteStream(filePath);

        request
          .get(image.mediumUrl)
          .on('complete', (response: any) => {
            // FIXME: how do we measure success / failure here?
            reporter.report.images.succeeded.push(`${image.mediumUrl}->${filePath}`);
            _resolve(response);
          })
          .on('error', (err: any) => {
            logger.error(err);

            logger.error(`An error occurred while downloading image : ${image.mediumUrl} -> ${filePath}`);
            reporter.report.images.failed.push(`${image.mediumUrl}->${filePath}`);
            reject(err);
          })
          .pipe(writer);
      }),
  );

  return Promise.all(imagePromises);
}

/**
 * Returns urls of images to download and re-writes post urls to point locally.
 * @param {*} imageStorageStrategy
 * @param {*} document
 * @param {*} imageBasePath
 * @param {*} postSlug
 * @returns
 */
function getMediumImages(
  imageStorageStrategy: MedmarkImageStorageStrategy,
  document: MedmarkParsedDocument,
  imageBasePath: string,
  postSlug: string,
): MedmarkTemplateRenderOptionsImage[] {
  const images: MedmarkTemplateRenderOptionsImage[] = [];

  document('img.graf-image').each(async function (index: number) {
    const imageName: string = document(this).attr('data-image-id');
    const ext: string = extname(imageName);

    // get max resolution of image
    const imgUrl: string = `https://cdn-images-1.medium.com/max/2600/${imageName}`;

    const localImageName: string = `${postSlug}-${index}${ext}`; // some-post-name-01.jpg
    const localImagePath: string = join(imageBasePath, localImageName); // full path including folder

    const imgData: MedmarkTemplateRenderOptionsImage = {
      localName: localImageName,
      localPath: localImagePath, // local path including filename we'll save it as
      mediumUrl: imgUrl,
    };

    images.push(imgData);

    // Rewrite img urls in post if the storage strategy is local.
    if (imageStorageStrategy === MedmarkImageStorageStrategy.LOCAL) {
      document(this).attr('src', localImagePath);
    }
  });

  return images;
}

async function gatherPostData(content, options, filePath, postsToSkip) {
  output.note({
    bodyLines: [filePath],
    title: 'Gathering post data started',
  });

  const $ = cheerio.load(content);

  try {
    await inlineGists($, reporter);
  } catch (e) {
    output.error({
      bodyLines: [`File Path: ${filePath}`, `Stack Trace: ${e}`],
      title: 'An error occurred while inlining Gists',
    });
  }

  const filename = basename(filePath, '.html');
  const isDraft = filename.startsWith('draft');
  const blogTitle = $('.graf--leading').first().text();

  if (postsToSkip && postsToSkip.some(post => blogTitle.startsWith(post))) {
    logger.warn(`This is a reply, not a standalone post. Hence, skipping...`);
    reporter.report.posts.replies.push(filePath);
    // FIXME: consider setting type of err and then ignoring it at the higher level
    throw new MedmarkSilentException(`Reply post. Skip over this one: ${blogTitle}`);
  }

  let canonicalLink = $('footer > p > a').attr('href');
  let titleForSlug = convertToSlug(blogTitle);

  // TODO: add no match condition...
  if (!isDraft) {
    canonicalLink = $('.p-canonical').attr('href');

    const [, slug] = canonicalLink.match(/https:\/\/medium\.com\/.+\/(.+)-[a-z0-9]+$/i);
    titleForSlug = slug;
  }

  // This will get the image urls, and rewrite the src in the content
  const imagesToSave = getMediumImages(options.imageStorageStrategy, $, options.imagePath, titleForSlug);

  const subtitle = $('section.p-summary').text();

  // $2 is for the post on medium instead of the local file...
  const postBody = await scrapeMetaDetailsFromPost(canonicalLink);

  // check if standalone post or reply
  const isReplyPost = postBody.match(/inResponseToPostId":"[0-9a-z]+"/); // this is in markup for reply posts

  if (isReplyPost) {
    logger.warn(`This is a reply, not a standalone post. Hence, skipping...`);
    reporter.report.posts.replies.push(filePath);
    // FIXME: consider setting type of err and then ignoring it at the higher level
    throw new MedmarkSilentException(`reply post. Skip over this one: ${titleForSlug}`);
  }

  const $2 = cheerio.load(postBody);
  const description = $2('meta[name=description]').attr('content'); // from page...

  const schemaTags = $2('script[type="application/ld+json"]');
  // FIXME: TS ISSUE
  const metaData = JSON.parse((schemaTags[0].children[0] as any).data);
  const readingTime = $2('.pw-reading-time').text();

  if (debug.enabled) {
    debug.saveLog(blogTitle, 'metaData', metaData);
  }

  const scripts = $2('script');

  let apolloState = null;
  let tags = [];
  let authors = [];

  // FIXME: TS ISSUE
  Object.values(scripts).forEach((value: any) => {
    if (
      value.children &&
      value.children[0] &&
      value.children[0].data &&
      value.children[0].data.startsWith('window.__APOLLO_STATE__')
    ) {
      try {
        apolloState = JSON.parse(value.children[0].data.replace('window.__APOLLO_STATE__ = ', ''));

        if (debug.enabled) {
          debug.saveLog(blogTitle, 'apolloState', apolloState);
        }

        tags = getTags(apolloState);
        authors = getAuthors(apolloState, metaData);
      } catch (e) {
        logger.error(`An error ocurred while parsing Apollo state from scaped metadata: ${e}`);
      }
    }
  });

  const title = $('h1').text();

  // FIXME: put this in fn
  // REMOVE h1 and avatar section
  $('h1').next().remove(); // remove div avatar domEl right after h1
  $('h1').remove();

  // process code blocks
  // medium exports inline code block as <code></code> and multi-line as <pre></pre>
  // We need to wrap the content of the <pre> with <code> tags so turndown parser won't escape the codeblock content
  $('pre').map(function () {
    let codeBlockContent = $(this).html();
    codeBlockContent = `<code>${codeBlockContent}</code>`;

    const newEl = $(this).html(codeBlockContent);
    return newEl;
  });

  try {
    await embedTweets($);
  } catch (e) {
    logger.error(`An error occurred while embedding tweets: ${filePath}`);
  }

  let posts = null;
  try {
    posts = transformHtmlToMarkdown($('.section-content').html(), options);
  } catch (e) {
    logger.error(`An error occured while converting Html to Markdown: ${e}`);
  }

  const post = {
    authors,
    body: posts,
    bodyRaw: $('.section-content').html(),
    description,
    draft: isDraft,
    images: imagesToSave,
    published: $('time').attr('datetime'),
    readingTime,
    subtitle,
    tags,
    title,
    titleForSlug,
  };

  return post;
}

async function convertMediumFile(
  filePath: string,
  outputPath: string,
  templatePath: string,
  exportDrafts: boolean,
  postsToSkip: string[],
): Promise<void> {
  const PATHS = {
    file: filePath,
    output: outputPath,
    template: templatePath,
  };

  const loadedTemplateModule: {default: MedmarkTemplate} | null =
    PATHS.template && (await import(resolve(PATHS.template)));
  const template: MedmarkTemplate = loadedTemplateModule?.default ?? DefaultTemplate;

  const options: MedmarkOptions = template.getOptions();

  const filename: string = basename(PATHS.file, '.html');

  output.note({
    bodyLines: [`PATH: ${PATHS.file}`, `FILE: ${filename}`],
    title: 'Converting',
  });

  if (filename.startsWith('draft')) {
    reporter.report.posts.drafts.push(PATHS.file);

    if (!exportDrafts) {
      output.warn({
        title: `This is a Draft. Export draft feature was not set. Hence, skipping...`,
      });
      return;
    }
  }

  reporter.report.posts.attempted.push(PATHS.file);

  const srcFilepath: string = PATHS.file;
  const content: Buffer = fs.readFileSync(PATHS.file);

  try {
    const postData: MedmarkTemplateRenderOptions = await gatherPostData(content, options, srcFilepath, postsToSkip);
    postData.draft = exportDrafts;

    let imageFolder: string = resolve(options.imagePath);
    const templateRenderOutput: string = template.render(postData);

    // if true, make folder for each slug, and name it '[slug]/index.md'
    if (options.folderForEachSlug) {
      PATHS.output = join(PATHS.output, postData.titleForSlug);
      imageFolder = join(PATHS.output, options.imagePath);
      PATHS.file = 'index';
    }

    // make outputFolder if it doesn't exist yet
    mkdirp.sync(PATHS.output);

    try {
      // render post file to folder
      writePostToFile(templateRenderOutput, PATHS.file, PATHS.output);
    } catch (e) {
      logger.error(`Couldn't write the post to: ${PATHS.output}`);
    }

    if (options.imageStorageStrategy === MedmarkImageStorageStrategy.LOCAL) {
      try {
        await saveImagesToLocal(imageFolder, postData.images);
      } catch (e) {
        logger.error(`An error occurred while saving the images to local directory. Blog: ${postData.titleForSlug}`);
      }
    }

    reporter.report.posts.succeeded.push(PATHS.file);
  } catch (error) {
    if (error instanceof MedmarkSilentException) {
      logger.warn(error.toString());
    } else {
      logger.error(`An error occurred while performing the markdown conversion. Blog: ${error}`);
    }

    // re-throw if you want it to bubble up
    if (error.type !== 'silent') {
      throw new MedmarkException(`Error occurred while converting medium: ${error}`);
    }
  }
}

async function convert(
  srcPath: string,
  outputPath: string,
  templatePath: string,
  exportDrafts: boolean,
  postsToSkip: string[],
): Promise<void> {
  const PATHS = {
    output: outputPath,
    src: srcPath,
    template: templatePath,
  };

  output.announceCheckpoint('🐱 Started converting.');

  if (!outputPath) {
    PATHS.output = '.';
  }

  const isDir: boolean = fs.lstatSync(PATHS.src).isDirectory();

  let promises = [];

  if (isDir) {
    // folder was passed in, so get all html files for folders
    fs.readdirSync(PATHS.src).forEach((file: string) => {
      const curFile: string = join(PATHS.src, file);

      if (file.endsWith('.html')) {
        promises.push(convertMediumFile(curFile, PATHS.output, PATHS.template, exportDrafts, postsToSkip));
      } else {
        logger.warn(`Skipping ${curFile} because it is not an html file.`);
      }
    });
  } else {
    promises = [convertMediumFile(resolve(PATHS.src), PATHS.output, PATHS.template, exportDrafts, postsToSkip)];
  }

  try {
    const result: any[] = await Promise.all(promises);

    output.success({title: `Successfully converted ${result.length} files.`});
    reporter.printPrettyReport();
    reporter.saveReportToFile(PATHS.output);

    logger.info(
      `Medium files from "${resolve(PATHS.src)}" have finished converting to "${resolve(PATHS.output)}" using the "${
        PATHS.template
      }" template.`,
    );
    logger.info(`Detailed output report named "conversion_report.json" can be found in the output folder.`);
  } catch (e) {
    logger.error(`Error during conversion!: ${e}`);
  }
}

export default convert;
