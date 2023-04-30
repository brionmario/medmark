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
import cheerio, {CheerioAPI, Element, Cheerio} from 'cheerio';
import mkdirp from 'mkdirp';
import {join, resolve, basename, extname} from 'path';
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
import {MediumApolloState, MediumPostMetadata} from './models/medium';
import {MedmarkFrontMatterAuthor} from './models/medmark/front-matter';

interface Paths {
  /**
   * Medium post file path.
   */
  file?: string;
  /**
   * Path to the medium export's posts directory that is taken as an input.
   */
  input?: string;
  /**
   * Path of the folder to output.
   */
  output?: string;
  /**
   * Path to the template.
   */
  template?: string;
}

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

/**
 * Saves images to a local directory.
 *
 * @param folderPath - The path to the local directory where images will be saved.
 * @param images - The array of image objects to download and save.
 * @returns A promise that resolves when all images have been downloaded and saved.
 */
async function saveImagesToLocal(folderPath: string, images: MedmarkTemplateRenderOptionsImage[]): Promise<any> {
  const imagePromises: Promise<void>[] = images.map(
    (image: MedmarkTemplateRenderOptionsImage) =>
      new Promise((_resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => {
        const imageFilePath: string = join(folderPath, image.localName);
        mkdirp.sync(folderPath);

        logger.info(`Downloading image : ${image.mediumUrl} -> ${imageFilePath}`);
        reporter.report.images.attempted.push(image.mediumUrl);

        const writer: WriteStream = fs.createWriteStream(imageFilePath);

        request
          .get(image.mediumUrl)
          .on('complete', (response: any) => {
            // FIXME: how do we measure success / failure here?
            reporter.report.images.succeeded.push(`${image.mediumUrl}->${imageFilePath}`);
            _resolve(response);
          })
          .on('error', (err: any) => {
            logger.error(err);

            logger.error(`An error occurred while downloading image : ${image.mediumUrl} -> ${imageFilePath}`);
            reporter.report.images.failed.push(`${image.mediumUrl}->${imageFilePath}`);
            reject(err);
          })
          .pipe(writer);
      }),
  );

  return Promise.all(imagePromises);
}

/**
 * Returns an array of image data for all images in a Medium post.
 *
 * @param imageStorageStrategy The strategy for storing images.
 * @param document The parsed HTML document of the Medium post.
 * @param imageBasePath The base path for saving images.
 * @param postSlug The slug of the Medium post.
 * @returns An array of image data objects.
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

/**
 * Asynchronously gathers data from a Medium post.
 *
 * @param content - The HTML content of the Medium post.
 * @param options - Options for gathering post data.
 * @param filePath - The path of the file containing the Medium post.
 * @param postsToSkip - An array of titles of posts to skip.
 * @returns A Promise that resolves with an object containing data to render a Medmark template.
 */
async function gatherPostData(
  content: Buffer,
  options: MedmarkOptions,
  filePath: string,
  postsToSkip: string[],
): Promise<MedmarkTemplateRenderOptions> {
  output.note({
    bodyLines: [filePath],
    title: 'Gathering post data started',
  });

  const $cheerio: /* The above code is not valid as it contains three different programming languages:
  TypeScript, CheerioAPI, and */
  CheerioAPI = cheerio.load(content);

  try {
    await inlineGists($cheerio, reporter);
  } catch (e) {
    output.error({
      bodyLines: [`File Path: ${filePath}`, `Stack Trace: ${e}`],
      title: 'An error occurred while inlining Gists',
    });
  }

  const filename: string = basename(filePath, '.html');
  const isDraft: boolean = filename.startsWith('draft');
  const blogTitle: string = $cheerio('.graf--leading').first().text();

  if (postsToSkip && postsToSkip.some((post: string) => blogTitle.startsWith(post))) {
    logger.warn(`This is a reply, not a standalone post. Hence, skipping...`);
    reporter.report.posts.replies.push(filePath);
    // FIXME: consider setting type of err and then ignoring it at the higher level
    throw new MedmarkSilentException(`Reply post. Skip over this one: ${blogTitle}`);
  }

  let canonicalLink: string = $cheerio('footer > p > a').attr('href');
  let titleForSlug: string = convertToSlug(blogTitle);

  // TODO: add no match condition...
  if (!isDraft) {
    canonicalLink = $cheerio('.p-canonical').attr('href');

    const [, slug] = canonicalLink.match(/https:\/\/medium\.com\/.+\/(.+)-[a-z0-9]+$/i);
    titleForSlug = slug;
  }

  // This will get the image urls, and rewrite the src in the content
  const imagesToSave: MedmarkTemplateRenderOptionsImage[] = getMediumImages(
    options.imageStorageStrategy,
    $cheerio,
    options.imagePath,
    titleForSlug,
  );

  const subtitle: string = $cheerio('section.p-summary').text();

  // $2 is for the post on medium instead of the local file...
  const postBody: string = await scrapeMetaDetailsFromPost(canonicalLink);

  // check if standalone post or reply
  const isReplyPost: RegExpMatchArray = postBody.match(/inResponseToPostId":"[0-9a-z]+"/); // this is in markup for reply posts

  if (isReplyPost) {
    logger.warn(`This is a reply, not a standalone post. Hence, skipping...`);
    reporter.report.posts.replies.push(filePath);
    // FIXME: consider setting type of err and then ignoring it at the higher level
    throw new MedmarkSilentException(`reply post. Skip over this one: ${titleForSlug}`);
  }

  const $cheerioBody: CheerioAPI = cheerio.load(postBody);
  const description: string = $cheerioBody('meta[name=description]').attr('content'); // from page...

  const schemaTags: Cheerio<Element> = $cheerioBody('script[type="application/ld+json"]');
  // FIXME: TS ISSUE
  const metaData: MediumPostMetadata = JSON.parse((schemaTags[0].children[0] as any).data);
  const readingTime: string = $cheerioBody('.pw-reading-time').text();

  if (debug.enabled) {
    debug.saveLog(blogTitle, 'metaData', metaData);
  }

  const scripts: Cheerio<Element> = $cheerioBody('script');

  let apolloState: MediumApolloState = null;
  let tags: string[] = [];
  let authors: MedmarkFrontMatterAuthor[] = [];

  // FIXME: TS ISSUE
  Object.values(scripts).forEach((value: Element & {children: (Element & {data: string})[]}) => {
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

  const title: string = $cheerio('h1').text();

  // FIXME: put this in fn
  // REMOVE h1 and avatar section
  $cheerio('h1').next().remove(); // remove div avatar domEl right after h1
  $cheerio('h1').remove();

  // process code blocks
  // medium exports inline code block as <code></code> and multi-line as <pre></pre>
  // We need to wrap the content of the <pre> with <code> tags so turndown parser won't escape the codeblock content
  $cheerio('pre').map(function () {
    let codeBlockContent: string = $cheerio(this).html();
    codeBlockContent = `<code>${codeBlockContent}</code>`;

    const newEl: Cheerio<Element> = $cheerio(this).html(codeBlockContent);
    return newEl;
  });

  try {
    await embedTweets($cheerio);
  } catch (e) {
    logger.error(`An error occurred while embedding tweets: ${filePath}`);
  }

  let posts: string = null;
  try {
    posts = transformHtmlToMarkdown($cheerio('.section-content').html(), options);
  } catch (e) {
    logger.error(`An error occured while converting Html to Markdown: ${e}`);
  }

  return {
    authors,
    body: posts,
    bodyRaw: $cheerio('.section-content').html(),
    description,
    draft: isDraft,
    images: imagesToSave,
    published: $cheerio('time').attr('datetime'),
    readingTime,
    subtitle,
    tags,
    title,
    titleForSlug,
  };
}

/**
 * Converts a Medium file to markdown.
 *
 * @param filePath - The path to the Medium file.
 * @param outputPath - The path to write the output file to.
 * @param templatePath - The path to the template file to use.
 * @param exportDrafts - Whether to export drafts or not.
 * @param postsToSkip - An array of post slugs to skip.
 * @returns A Promise that resolves when the conversion is complete.
 * @throws A MedmarkException if an error occurs while converting the Medium file.
 */
async function convertMediumFile(
  filePath: string,
  outputPath: string,
  templatePath: string,
  exportDrafts: boolean,
  postsToSkip: string[],
): Promise<void> {
  const PATHS: Paths = {
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

/**
 * Converts Medium post(s) from an input file or directory of files to a HTML file(s) using a template.
 *
 * @param inputPath - The file path to the input file or directory of files.
 * @param outputPath - The file path to the output directory for the converted file(s).
 * @param templatePath - The file path to the template file to use for the conversion.
 * @param exportDrafts - Whether to include draft posts in the conversion.
 * @param postsToSkip - An array of post URLs to skip during the conversion.
 */
async function convert(
  inputPath: string,
  outputPath: string,
  templatePath?: string,
  exportDrafts: boolean = false,
  postsToSkip: string[] = [],
): Promise<void> {
  const PATHS: Paths = {
    input: inputPath,
    output: outputPath,
    template: templatePath,
  };

  output.announceCheckpoint('🐱 Started converting.');

  const isDir: boolean = fs.lstatSync(PATHS.input).isDirectory();

  const promises: Promise<void>[] = [];

  if (isDir) {
    // folder was passed in, so get all html files for folders
    fs.readdirSync(PATHS.input).forEach((file: string) => {
      const curFile: string = join(PATHS.input, file);

      if (file.endsWith('.html')) {
        promises.push(convertMediumFile(curFile, PATHS.output, PATHS.template, exportDrafts, postsToSkip));
      } else {
        logger.warn(`Skipping ${curFile} because it is not an html file.`);
      }
    });
  } else {
    promises.push(convertMediumFile(resolve(PATHS.input), PATHS.output, PATHS.template, exportDrafts, postsToSkip));
  }

  try {
    await Promise.all(promises);

    output.success({title: `Successfully converted ${promises.length} files.`});
    reporter.printPrettyReport();
    reporter.saveReportToFile(PATHS.output);

    logger.info(
      `Medium files from "${resolve(PATHS.input)}" have finished converting to "${resolve(PATHS.output)}" using the "${
        PATHS.template || 'default'
      }" template.`,
    );
    logger.info(`Detailed output report named "conversion_report.json" can be found in the output folder.`);
  } catch (e) {
    logger.error(`Error during conversion!: ${e}`);
  }
}

export default convert;
