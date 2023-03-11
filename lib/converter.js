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

const fakeUa = require('fake-useragent');
const request = require('request');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const mkdirp = require('mkdirp');
const http = require('./http');
const markdownUtils = require('./markdown');
const press = require('./press');
const Reporter = require('./reporter');
const debug = require('./debug');
const {KNOWN_POSTS_TO_SKIP, ImageStorageStrategies} = require('./constants');
const {embedTweets} = require('./twitter');
const {convertToSlug, writePostToFile, getAuthors, getTags} = require('./utils');
const MediumToMarkdownSilentException = require('./exceptions/medium-to-markdown-silent-exception');

// global state. FIXME: consider localizing this more...
const reporter = Reporter.getInstance();

// handle promise errors
process.on('unhandledRejection', up => {
  console.log('err', up);
  // throw up;
});

// primary entry point
async function convertMediumFile(filePath, outputFolder, templatePath, export_drafts) {
  press.print('Converting: ', true, true);
  press.printItem(`PATH: ${filePath}`);

  const template = require(templatePath);
  const options = template.getOptions();

  // don't process drafts
  const filename = path.basename(filePath, '.html');

  press.printItem(`FILE: ${filename}`, false, true);

  if (filename.startsWith('draft')) {
    // console.log('Skipping over draft file ', filePath);
    reporter.report.posts.drafts.push(filePath);
    // throw 'draft file'; // equivalent of promise.reject
    // if we don't want to export drafts then bail
    if (!export_drafts) {
      press.printItem(`This is a Draft. Export draft feature was not set. Hence, skipping...`, false, false, 1);
      return;
    }
  }

  reporter.report.posts.attempted.push(filePath);

  const srcFilepath = filePath;
  const content = fs.readFileSync(filePath);

  try {
    const postData = await gatherPostData(content, options, srcFilepath);
    postData.draft = export_drafts;

    let imageFolder = path.resolve(options.imagePath);
    const output = template.render(postData);

    // if true, make folder for each slug, and name it '[slug]/index.md'
    if (options.folderForEachSlug) {
      outputFolder = path.join(outputFolder, postData.titleForSlug);
      imageFolder = path.join(outputFolder, options.imagePath);
      filePath = 'index';
    }

    // make outputFolder if it doesn't exist yet
    mkdirp.sync(outputFolder);

    // console.log(
    //   `processing: ${srcFilepath} -> ${path.join(outputFolder, filePath)}.md`,
    // );

    try {
      // render post file to folder
      writePostToFile(output, filePath, outputFolder);
    } catch (e) {
      press.printItem(`Successfully wrote the post to: ${output}`, false, false, 3);
    }

    if (options.imageStorageStrategy === ImageStorageStrategies.LOCAL) {
      try {
        // save post images to the local image folder
        await saveImagesToLocal(imageFolder, postData.images);
      } catch (e) {
        press.printItem(
          `An error occurred while saving the images to local directory. Blog: ${postData.titleForSlug}`,
          false,
          false,
          2,
        );
      }
    }

    reporter.report.posts.succeeded.push(filePath);
  } catch (err) {
    press.printItem(`An error occurred while performing the markdown conversion. Blog: ${err}`, false, false, 2);
    // re-throw if you want it to bubble up
    if (err.type != 'silent') throw err;
  }
  // });
}

async function gatherPostData(content, options, filePath) {
  press.printItem(`Gathering post data started: ${filePath}`, false, false, 0);

  const $ = cheerio.load(content);

  try {
    await inlineGists($);
  } catch (e) {
    press.printItem(`An error occurred while inlining Gists: ${filePath}`, false, false, 2);
  }

  const filename = path.basename(filePath, '.html');
  const is_draft = filename.startsWith('draft');
  const blogTitle = $('.graf--leading').first().text();

  if (KNOWN_POSTS_TO_SKIP.some(post => blogTitle.startsWith(post))) {
    press.printItem(`This is a reply, not a standalone post. Hence, skipping...`, false, false, 1);
    reporter.report.posts.replies.push(filePath);
    // FIXME: consider setting type of err and then ignoring it at the higher level
    throw new MediumToMarkdownSilentException(`reply post. Skip over this one: ${titleForSlug}`);
  }

  // TODO: add no match condition...
  if (!is_draft) {
    var canonicalLink = $('.p-canonical').attr('href');
    const match = canonicalLink.match(/https:\/\/medium\.com\/.+\/(.+)-[a-z0-9]+$/i);
    var titleForSlug = match[1];
  } else {
    // construct a canonical link
    var canonicalLink = $('footer > p > a').attr('href');
    var titleForSlug = convertToSlug(blogTitle);
  }

  // This will get the image urls, and rewrite the src in the content
  const imagesToSave = getMediumImages(options.imageStorageStrategy, $, options.imagePath, titleForSlug);

  const subtitle = $('section.p-summary').text();

  // $2 is for the post on medium instead of the local file...
  const postBody = await scrapeMetaDetailsFromPost(canonicalLink);

  // check if standalone post or reply
  const isReplyPost = postBody.match(/inResponseToPostId":"[0-9a-z]+"/); // this is in markup for reply posts

  if (isReplyPost) {
    press.printItem(`This is a reply, not a standalone post. Hence, skipping...`, false, false, 1);
    reporter.report.posts.replies.push(filePath);
    // FIXME: consider setting type of err and then ignoring it at the higher level
    throw new MediumToMarkdownSilentException(`reply post. Skip over this one: ${titleForSlug}`);
  }

  const $2 = cheerio.load(postBody);
  const description = $2('meta[name=description]').attr('content'); // from page...

  const schemaTags = $2('script[type="application/ld+json"]');
  const metaData = JSON.parse(schemaTags[0].children[0].data);
  const readingTime = $2('.pw-reading-time').text();

  if (debug.enabled) {
    debug.createSample('metaData', metaData);
  }

  const scripts = $2('script');

  let apolloState = null;
  let tags = [];
  let authors = [];

  Object.values(scripts).map(value => {
    if (
      value.children &&
      value.children[0] &&
      value.children[0].data &&
      value.children[0].data.startsWith('window.__APOLLO_STATE__')
    ) {
      try {
        apolloState = JSON.parse(value.children[0].data.replace('window.__APOLLO_STATE__ = ', ''));

        if (debug.enabled) {
          debug.createSample('apolloState', apolloState);
        }

        tags = getTags(apolloState);
        authors = getAuthors(apolloState, metaData);
      } catch (e) {
        press.printItem(`An error ocurred while parsing Appolo state from scaped metadata: ${e}`, false, false, 2);
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
  $('pre').map(function (i, el) {
    let codeBlockContent = $(this).html();
    codeBlockContent = `<code>${codeBlockContent}</code>`;

    const newEl = $(this).html(codeBlockContent);
    return newEl;
  });

  try {
    await embedTweets($);
  } catch (e) {
    press.printItem(`An error occurred while embedding tweets: ${filePath}`, false, false, 2);
  }

  let posts = null;
  try {
    posts = convertHtmlToMarkdown($('.section-content').html(), options);
  } catch (e) {
    press.printItem(`An error occured while converting Html to Markdown`, false, false, 2);
  }

  const post = {
    authors,
    title,
    description,
    draft: is_draft,
    subtitle,
    published: $('time').attr('datetime'),
    bodyRaw: $('.section-content').html(),
    titleForSlug,
    tags,
    images: imagesToSave,
    body: posts,
    readingTime,
  };

  return post;
}

// convert the post body
function convertHtmlToMarkdown(html, templateOptions) {
  return markdownUtils.transformHtmlToMarkdown(html, templateOptions);
}

async function scrapeMetaDetailsFromPost(url) {
  const headers = {
    'User-Agent': fakeUa(),
  };

  // FIXME: add error handling conditions...
  const resp = await http.get({url, headers});
  return resp.body;
}

// attempts to take gist script tags, then downloads the raw content, and places in <pre> tag which will be converted to
// fenced block (```) by turndown
async function inlineGists($) {
  // get all script tags on thet page
  // FIXME: can do away with promises here entirely?
  const promises = [];

  $('script').each(async function (i, item) {
    const prom = new Promise(async (resolve, reject) => {
      const src = $(this).attr('src');
      const isGist = src.includes('gist');

      if (isGist) {
        try {
          // console.log('feching raw gist source for: ', src);
          reporter.report.gists.attempted.push(src);
          const rawGist = await getRawGist(src);
          reporter.report.gists.succeeded.push(src);

          // replace rawGist in markup
          // FIXME: just modify this in turndown?
          const inlineCode = $(`<pre>${rawGist}</pre>`); // this turns into ``` codefence

          // FIXME: guard to ensure <figure> parent is removed
          // Replace the <figure> parent node with code fence
          $(this).parent().replaceWith(inlineCode);

          resolve();
        } catch (e) {
          reporter.report.gists.failed.push(src);
          reject(e);
        }
      }

      // FIXME: if this is not a Gist, resole(). Else the operation will hang if there are no Gists in the post.
      resolve();
    });

    promises.push(prom);
  });

  return await Promise.all(promises);
}

// get the raw gist from github
async function getRawGist(gistUrl) {
  let newUrl = gistUrl.replace('github.com', 'githubusercontent.com');

  // remove suffix (like .js) (maybe use it for code fencing later...)
  // FIXME: this is hacky
  const gistID = newUrl.split('/')[4]; // FIXME: guard for error
  if (gistID.includes('.')) {
    const ext = path.extname(gistID);
    newUrl = newUrl.replace(ext, ''); // srip extension (needed for raw fetch to work)
  }

  newUrl += '/raw';

  // make the call
  const resp = await http.get({url: newUrl});
  if (resp.statusCode === 200) {
    return resp.body;
  }
}

// returns urls of images to download and re-writes post urls to point locally
function getMediumImages(imageStorageStrategy, $, imageBasePath, postSlug) {
  const images = [];

  $('img.graf-image').each(async function (i, item) {
    const imageName = $(this).attr('data-image-id');
    const ext = path.extname(imageName);

    // get max resolution of image
    const imgUrl = `https://cdn-images-1.medium.com/max/2600/${imageName}`;

    const localImageName = `${postSlug}-${i}${ext}`; // some-post-name-01.jpg
    const localImagePath = path.join(imageBasePath, localImageName); // full path including folder

    const imgData = {
      mediumUrl: imgUrl,
      localName: localImageName,
      localPath: localImagePath, // local path including filename we'll save it as
    };

    images.push(imgData);

    // Rewrite img urls in post if the storage strategy is local.
    if (imageStorageStrategy === ImageStorageStrategies.LOCAL) {
      $(this).attr('src', localImagePath);
    }
  });

  return images;
}

async function saveImagesToLocal(imageFolder, images) {
  const imagePromises = images.map(
    image =>
      new Promise((resolve, reject) => {
        const filePath = path.join(imageFolder, image.localName);
        mkdirp.sync(imageFolder); // fs.writeFileSync(p, images[0].binary, 'binary');

        press.printItem(`Downloading image : ${image.mediumUrl} -> ${filePath}`, false, false, 0);
        reporter.report.images.attempted.push(image.mediumUrl);
        // request(image.mediumUrl).pipe(fs.createWriteStream(filePath)); // request image from medium CDN and save locally. TODO: add err handling

        const writer = fs.createWriteStream(filePath);

        request
          .get(image.mediumUrl)
          .on('complete', response => {
            // FIXME: how do we measure success / failure here?
            reporter.report.images.succeeded.push(`${image.mediumUrl}->${filePath}`);
            resolve(response);
          })
          .on('error', err => {
            console.log(err);
            press.printItem(
              `An error occurred while downloading image : ${image.mediumUrl} -> ${filePath}`,
              false,
              false,
              2,
            );
            reporter.report.images.failed.push(`${image.mediumUrl}->${filePath}`);
            reject(err);
          })
          .pipe(writer);
      }),
  );

  return await Promise.all(imagePromises);
}

// writePostFile(metaTemplate);
module.exports = {
  async convert(srcPath, outputFolder = '.', templatePathStr, export_drafts) {
    press.announceCheckpoint('🐱 Started converting.');

    const isDir = fs.lstatSync(srcPath).isDirectory();
    // TODO: This is un-used.
    const isFile = fs.lstatSync(srcPath).isFile();

    const defaultTemplate = path.resolve(path.join(__dirname, '../templates/default.js'));

    let templatePath = defaultTemplate;
    // if template passed in, load that instead of default
    if (templatePathStr) {
      templatePath = path.resolve(templatePathStr);
    }

    var promises = [];

    if (isDir) {
      // folder was passed in, so get all html files for folders
      fs.readdirSync(srcPath).forEach(file => {
        const curFile = path.join(srcPath, file);

        if (file.endsWith('.html')) {
          promises.push(convertMediumFile(curFile, outputFolder, templatePath, export_drafts));
          // } else {
          // promises.push(Promise.resolve('not html file')); // FIXME: is this needed?
        }
      });
    } else {
      var promises = [convertMediumFile(path.resolve(srcPath), outputFolder, templatePath, export_drafts)];
    }

    try {
      const result = await Promise.all(promises);
      // console.log('ALL DONE', report);
      reporter.printPrettyReport();
      reporter.saveReportToFile(outputFolder);
      console.log(
        `Medium files from "${path.resolve(srcPath)}" have finished converting to "${path.resolve(
          outputFolder,
        )}" using the "${templatePathStr}" template.`,
      );
      console.log(`Detailed output report named "conversion_report.json" can be found in the output folder.`);
    } catch (e) {
      console.log('Error during conversion!', e);
    }
  },
};
