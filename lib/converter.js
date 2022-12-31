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

var fakeUa = require('fake-useragent');
var request = require('request');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var util = require('util');
var mkdirp = require('mkdirp');
var logger = require('./logger');
var markdownUtils = require('./markdown');
var press = require('./press');
var debug = require('./debug');

var makeRequest = util.promisify(request.get);

// FIXME: Figure out a better way to identify replies.
var KNOWN_POSTS_TO_SKIP = [
  'Hi Rohan,',
  'IS is blocking CORS requests by default.',
  "Nice catch. I've fixed the typo. Thanks a lot 😀",
];

var ImageStorageStrategies = Object.freeze({
  LOCAL: 'LOCAL',
});

// global state. FIXME: consider localizing this more...
var report = {
  posts: {
    attempted: [],
    succeeded: [],
    failed: [],
    drafts: [],
    replies: [],
  },
  gists: {
    attempted: [],
    succeeded: [],
    failed: [],
  },
  images: {
    attempted: [],
    succeeded: [],
    failed: [],
  },
};

// handle promise errors
process.on('unhandledRejection', up => {
  console.log('err', up);
  // throw up;
});

function convertToSlug(Text) {
  return Text.toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

// primary entry point
async function convertMediumFile(filePath, outputFolder, templatePath, export_drafts) {
  press.print('Converting: ', true, true);
  press.printItem(`PATH: ${filePath}`);

  var template = require(templatePath);
  var options = template.getOptions();

  // don't process drafts
  var filename = path.basename(filePath, '.html');

  press.printItem(`FILE: ${filename}`, false, true);

  if (filename.startsWith('draft')) {
    // console.log('Skipping over draft file ', filePath);
    report.posts.drafts.push(filePath);
    // throw 'draft file'; // equivalent of promise.reject
    // if we don't want to export drafts then bail
    if (!export_drafts) {
      press.printItem(`This is a Draft. Export draft feature was not set. Hence, skipping...`, false, false, 1);
      return;
    }
  }

  report.posts.attempted.push(filePath);

  var srcFilepath = filePath;
  var content = fs.readFileSync(filePath);

  try {
    var postData = await gatherPostData(content, options, srcFilepath);
    postData.draft = export_drafts;

    var imageFolder = path.resolve(options.imagePath);
    var output = template.render(postData);

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

    report.posts.succeeded.push(filePath);
  } catch (err) {
    // reject(err);
    // re-throw if you want it to bubble up
    if (err.type != 'silent') throw err;
  }
  // });
}

async function gatherPostData(content, options, filePath) {
  press.printItem(`Gathering post data started: ${filePath}`, false, false, 0);

  var $ = cheerio.load(content);

  try {
    await inlineGists($);
  } catch (e) {
    press.printItem(`An error occurred while inlining Gists: ${filePath}`, false, false, 2);
  }

  var filename = path.basename(filePath, '.html');
  var is_draft = filename.startsWith('draft');
  var blogTitle = $('.graf--leading').first().text();

  if (KNOWN_POSTS_TO_SKIP.some(post => blogTitle.startsWith(post))) {
    press.printItem(`This is a reply, not a standalone post. Hence, skipping...`, false, false, 1);
    report.posts.replies.push(filePath);
    // FIXME: consider setting type of err and then ignoring it at the higher level
    throw new SilentError('reply post. Skip over this one: ' + titleForSlug);
  }

  // TODO: add no match condition...
  if (!is_draft) {
    var canonicalLink = $('.p-canonical').attr('href');
    var match = canonicalLink.match(/https:\/\/medium\.com\/.+\/(.+)-[a-z0-9]+$/i);
    var titleForSlug = match[1];
  } else {
    // construct a canonical link
    var canonicalLink = $('footer > p > a').attr('href');
    var titleForSlug = convertToSlug(blogTitle);
  }

  // This will get the image urls, and rewrite the src in the content
  var imagesToSave = getMediumImages(options.imageStorageStrategy, $, options.imagePath, titleForSlug);

  var subtitle = $('section.p-summary').text();

  // $2 is for the post on medium instead of the local file...
  var postBody = await scrapeMetaDetailsFromPost(canonicalLink);

  // check if standalone post or reply
  var isReplyPost = postBody.match(/inResponseToPostId":"[0-9a-z]+"/); // this is in markup for reply posts

  if (isReplyPost) {
    press.printItem(`This is a reply, not a standalone post. Hence, skipping...`, false, false, 1);
    report.posts.replies.push(filePath);
    // FIXME: consider setting type of err and then ignoring it at the higher level
    throw new SilentError('reply post. Skip over this one: ' + titleForSlug);
  }

  var $2 = cheerio.load(postBody);
  var description = $2('meta[name=description]').attr('content'); // from page...

  var schemaTags = $2('script[type="application/ld+json"]');
  var metaData = JSON.parse(schemaTags[0].children[0].data);

  if (debug.enabled) {
    debug.createSample('metaData', metaData);
  }

  var scripts = $2('script');

  var apolloState = null;
  var tags = [];
  var authors = [];

  // TODO: Test with multiple authors.
  authors.push(metaData.author);

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
      } catch (e) {
        press.printItem(`An error ocurred while parsing Appolo state from scaped metadata.`, false, false, 2);
      }
    }
  });

  var title = $('h1').text();

  // FIXME: put this in fn
  // REMOVE h1 and avatar section
  $('h1').next().remove(); // remove div avatar domEl right after h1
  $('h1').remove();

  // process code blocks
  // medium exports inline code block as <code></code> and multi-line as <pre></pre>
  // We need to wrap the content of the <pre> with <code> tags so turndown parser won't escape the codeblock content
  $('pre').map(function (i, el) {
    var codeBlockContent = $(this).html();
    codeBlockContent = `<code>${codeBlockContent}</code>`;

    var newEl = $(this).html(codeBlockContent);
    return newEl;
  });

  // embedded tweets:
  // medium returns empty <a> which turndown throws out before we can process it.
  // add dummy link text so turndown won't discard it
  $('blockquote.twitter-tweet a').text('[Embedded tweet]');

  let posts = null;
  try {
    posts = convertHtmlToMarkdown($('.section-content').html(), options);
  } catch (e) {
    press.printItem(`An error occured while converting Html to Markdown`, false, false, 2);
  }

  var post = {
    authors: authors,
    title: title,
    description: description,
    draft: is_draft,
    subtitle: subtitle,
    published: $('time').attr('datetime'),
    bodyRaw: $('.section-content').html(),
    titleForSlug: titleForSlug,
    tags: tags,
    images: imagesToSave,
    body: posts,
  };

  return post;
}

// takes array of strings
/**
 * Scrape tags from the Apollo state from scraped metadata.
 *
 * Apollo state object has tabs in the following format.
 * And this function will extract them.
 * {
 *    "Tag:SOME_TAG": {
 *      ...
 *    }
 * }
 *
 * @param state - Apollo state from scraped Medium Page.
 * @returns Set of tags as string arrays.
 */
function getTags(state) {
  var tags = [];

  Object.keys(state).map(key => {
    if (key.startsWith('Tag:')) {
      tags.push(key.split(':')[1]);
    }
  });

  return tags;
}

var suffix = /\.html$/i;

// FIXME: get name from date + slug
function writePostToFile(content, oldFilePath, outputFolder) {
  var fileName = path.basename(oldFilePath, '.html');

  var newPath = path.resolve(path.join(outputFolder, fileName) + '.md');

  // console.log('newPath', newPath);
  fs.writeFileSync(newPath, content);
}

// convert the post body
function convertHtmlToMarkdown(html, templateOptions) {
  return markdownUtils.transformHtmlToMarkdown(html, templateOptions);
}

async function scrapeMetaDetailsFromPost(url) {
  var headers = {
    'User-Agent': fakeUa(),
  };

  // FIXME: add error handling conditions...
  var resp = await makeRequest({url: url, headers: headers});
  return resp.body;
}

// attempts to take gist script tags, then downloads the raw content, and places in <pre> tag which will be converted to
// fenced block (```) by turndown
async function inlineGists($) {
  // get all script tags on thet page
  // FIXME: can do away with promises here entirely?
  var promises = [];

  $('script').each(async function (i, item) {
    var prom = new Promise(async (resolve, reject) => {
      var src = $(this).attr('src');
      var isGist = src.includes('gist');
      if (isGist) {
        try {
          // console.log('feching raw gist source for: ', src);
          report.gists.attempted.push(src);
          var rawGist = await getRawGist(src);
          report.gists.succeeded.push(src);

          // replace rawGist in markup
          // FIXME: just modify this in turndown?
          var inlineCode = $(`<pre>${rawGist}</pre>`); //this turns into ``` codefence

          // FIXME: guard to ensure <figure> parent is removed
          // Replace the <figure> parent node with code fence
          $(this).parent().replaceWith(inlineCode);

          resolve();
        } catch (e) {
          report.gists.failed.push(src);
          reject(e);
        }
      }
    });
    promises.push(prom);
  });

  return await Promise.all(promises);
}

// get the raw gist from github
async function getRawGist(gistUrl) {
  var newUrl = gistUrl.replace('github.com', 'githubusercontent.com');

  // remove suffix (like .js) (maybe use it for code fencing later...)
  // FIXME: this is hacky
  var gistID = newUrl.split('/')[4]; // FIXME: guard for error
  if (gistID.includes('.')) {
    var ext = path.extname(gistID);
    newUrl = newUrl.replace(ext, ''); // srip extension (needed for raw fetch to work)
  }

  newUrl += '/raw';

  // make the call
  var resp = await makeRequest({url: newUrl});
  if (resp.statusCode === 200) {
    return resp.body;
  }
}

// returns urls of images to download and re-writes post urls to point locally
function getMediumImages(imageStorageStrategy, $, imageBasePath, postSlug) {
  var images = [];

  $('img.graf-image').each(async function (i, item) {
    var imageName = $(this).attr('data-image-id');
    var ext = path.extname(imageName);

    // get max resolution of image
    var imgUrl = `https://cdn-images-1.medium.com/max/2600/${imageName}`;

    var localImageName = `${postSlug}-${i}${ext}`; // some-post-name-01.jpg
    var localImagePath = path.join(imageBasePath, localImageName); // full path including folder

    var imgData = {
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
  var imagePromises = images.map(function (image) {
    return new Promise(function (resolve, reject) {
      var filePath = path.join(imageFolder, image.localName);
      mkdirp.sync(imageFolder); // fs.writeFileSync(p, images[0].binary, 'binary');

      press.printItem(`Downloading image : ${image.mediumUrl} -> ${filePath}`, false, false, 0);
      report.images.attempted.push(image.mediumUrl);
      // request(image.mediumUrl).pipe(fs.createWriteStream(filePath)); // request image from medium CDN and save locally. TODO: add err handling

      var writer = fs.createWriteStream(filePath);

      request
        .get(image.mediumUrl)
        .on('complete', function (response) {
          // FIXME: how do we measure success / failure here?
          report.images.succeeded.push(`${image.mediumUrl}->${filePath}`);
          resolve(response);
        })
        .on('error', function (err) {
          console.log(err);
          press.printItem(
            `An error occurred while downloading image : ${image.mediumUrl} -> ${filePath}`,
            false,
            false,
            2,
          );
          report.images.failed.push(`${image.mediumUrl}->${filePath}`);
          reject(err);
        })
        .pipe(writer);
    });
  });

  return await Promise.all(imagePromises);
}

// using this allows us to stop flow execution, but not throw all the way up the chain...
class SilentError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, SilentError);
    this.type = 'silent';
  }
}

function printPrettyReport() {
  var postsAttempted = report.posts.attempted.length;
  var postsSucceeded = report.posts.succeeded.length;
  var postsFailed = report.posts.failed.length;
  var postsFailedDetail = report.posts.failed;
  var postDrafts = report.posts.drafts.length;
  var postReplies = report.posts.replies.length;

  var imagesAttempted = report.images.attempted.length;
  var imagesSucceeded = report.images.succeeded.length;
  var imagesFailed = report.images.failed.length;
  var imagesFailedDetail = report.images.failed;

  var gistAttempted = report.gists.attempted.length;
  var gistSucceeded = report.gists.succeeded.length;
  var gistFailed = report.gists.failed.length;
  var gistFailedDetail = report.gists.failed;

  console.log('##############################################################');
  console.log('CONVERSION METRICS');
  console.log('posts attempted', postsAttempted);
  console.log('posts succeeded', postsSucceeded);
  console.log('posts replies that were ignored:', postReplies);
  console.log('posts drafts that were not attempted:', postDrafts);
  console.log('posts failed', postsFailed);
  console.log('Failed posts:', postsFailedDetail);
  console.log('');

  console.log('medium images attempted', imagesAttempted);
  console.log('images succeeded', imagesSucceeded);
  console.log('images failed', imagesFailed);
  console.log('Failed images:', imagesFailedDetail);
  console.log('');

  console.log('gists inlining attempted', gistAttempted);
  console.log('gists succeeded', gistSucceeded);
  console.log('gists failed', gistFailed);
  console.log('Failed gists:', gistFailedDetail);

  console.log('##############################################################');
}

function saveReportToFile(outputFolder) {
  fs.writeFileSync(path.join(outputFolder, 'conversion_report.json'), JSON.stringify(report));
}

// writePostFile(metaTemplate);
module.exports = {
  convert: async function (srcPath, outputFolder = '.', templatePathStr, export_drafts) {
    press.announceCheckpoint('🐱 Started converting.');

    var isDir = fs.lstatSync(srcPath).isDirectory();
    // TODO: This is un-used.
    var isFile = fs.lstatSync(srcPath).isFile();

    var defaultTemplate = path.resolve(path.join(__dirname, '../templates/default.js'));

    var templatePath = defaultTemplate;
    // if template passed in, load that instead of default
    if (templatePathStr) {
      templatePath = path.resolve(templatePathStr);
    }

    var promises = [];

    if (isDir) {
      // folder was passed in, so get all html files for folders
      fs.readdirSync(srcPath).forEach(file => {
        var curFile = path.join(srcPath, file);

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
      var result = await Promise.all(promises);
      // console.log('ALL DONE', report);
      printPrettyReport();
      saveReportToFile(outputFolder);
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
