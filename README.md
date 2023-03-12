<p align="center" style="padding-top: 20px">
  <img src="./docs/resources/medmark-logo.svg" height="50">
  <p align="center">Export your Medium articles to Markdown</p>
</p>

<div align="center">

  <a href="">[![npm version](https://badge.fury.io/js/medmark.svg)](https://badge.fury.io/js/medmark)</a>
  <a href="">[![Build](https://github.com/brionmario/medmark/actions/workflows/build.yml/badge.svg)](https://github.com/brionmario/medmark/actions/workflows/build.yml)</a>
  <a href="">[![Release](https://github.com/brionmario/medmark/actions/workflows/release.yml/badge.svg)](https://github.com/brionmario/medmark/actions/workflows/release.yml)</a>
  <a href=""><!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)<!-- ALL-CONTRIBUTORS-BADGE:END --></a>
  <a href="">[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-yellow.svg)](http://commitizen.github.io/cz-cli/)</a>
  <a href="">[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)</a>
</div>

# Table of Contents

- 💡 [Inspiration](#inspiration)
- [Prerequisites](#prerequisites)
- [API Reference](#api-reference)
    - [findPort](#findPort)
- [Examples](#examples)
- [Contributors](#contributors)
- [License](#license)

# Inspiration

Sometimes we need to show our users a bit more context when the development ports conflict. Most of the already available packages lacks the support to customize the prompts. This package tries to solve this issue along with a lot more helpers that would supplement development pipelines when working with dev ports.

# Prerequisites

- [Node.js](https://nodejs.org/en/download/) LTS version is recommended.

# API Reference

## `findPort`

```js
findPort(
  port: number,
  hostname?: string,
  shouldFallback?: boolean | undefined,
  reporter?: {
    extensions: Partial<IReporterExtensions>;
    overrides: Partial<IReporter>;
  }
)
```

### Returns

A `Promise` of type `number`.

### Description

|Argument|Type|Default Value|Required|Description|
|--------|----|-------------|--------|-----------|
|port|number| - |Yes|Prefered port to fire up the app in.|
|hostname|string| - |No|Host name of the application. `Ex: localhost or 127.0.0`|
|shouldFallback|boolean| true |No|Should the function return a an available port. You can set this to false if you wish to show just a message to the user in case of a port conflict.|
|reporter|`{ extensions: Partial<IReporterExtensions>; overrides: Partial<IReporter>;}`| - |No|Customize the messages shown to the user incase of a port conflict.|

### Usage

#### Basic Usage

`PORT` resolves to 3000 if the port is available. If the port is unavailable, users will get the chance to fallback to the nearest available port.

```js
const { findPort } = require("medmark");

const PORT = await findPort(3000);
```

##### Output

![Image](./docs/resources/port-conflict-output.png)

#### Resolve port with no fallback

If the port is not available, only a prompt will be shown to the user. You can customize this prompt to match the requirements.

```js
const { findPort } = require("medmark");

const PORT = await findPort(3000, "localhost", false, {
  extensions: {
    BEFORE_getProcessTerminationMessage: () => {
      return `Read through the README.md (https://github.com/brionmario/medmark/blob/main/README.md)
file for more information.`;
    }
  }
});
```

##### Output

![Image](./docs/resources/port-conflict-no-fallback-output.png)

# Examples

## Webpack Dev Server v4 example

Usage of the library with [Webpack Dev Server v4](https://github.com/webpack/webpack-dev-server/releases/tag/v4.8.1) which is the latest version at the time of writting, can be found below.

> 💡 Version 4.x doesn't allow to pass a function that returns a promise straight in to the `port` field of the `devServer` configuration.

- [Source Code](./examples/webpack-dev-server-4.x/).
# Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.brionmario.com/"><img src="https://avatars.githubusercontent.com/u/25959096?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Brion Mario</b></sub></a><br /><a href="https://github.com/Brion Mario/medmark/commits?author=brionmario" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

# License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

# medium-to-gatsby

 A CLI to convert your medium exported .html files to gatsby .md files.
 
 ## Features
- Converts medium .html files and outputs gatsby .md files.
- Customize output via templates
- Downloads post images from medium and saves locally
- Handles embedded tweets
- Inlines github gists 
- Allows default language for code blocks. 
- Skips over drafts and post replies.
- Generates report when done.

## Installation 
`$ npm install -g https://github.com/jamischarles/export-medium-to-gatsby` (maybe it'll go on npm eventually)

## Steps
1. [Download your medium posts as an archive from medium](https://help.medium.com/hc/en-us/articles/115004745787-Download-your-information).
2. Install this CLI via #Installation step above
3. Save a template file (see template section below) where you'll be running
   your export command.
4. Customize the template.js file you downloaded to match the [frontmatter](https://jekyllrb.com/docs/front-matter/) fields your gatsby blog requires. Here you also define what folder in your blog medium images should be downloaded to.
5. Run the CLI and use the `medium-export/posts` folder as the input, and for output either directly output to your `content/posts` folder, or copy it there after generating the files.
6. Verify that the generated files are correct and looks good.
7. Make any CSS and styling adjustments as needed.
8. Do a happy dance.

## CLI Usage 
```
 Usage
    $ medium2mdx <src_file_or_folder>

  Options
   --output, -o Destination folder for output files. Defaults to './'.
   --template, -t Template used to generate post files.
   --help, -h Shows usage instructions

  Examples
    $ medium2gatsby . -o posts -t template.js
    $ medium2gatsby 2018-04-02_Introducing-the-react-testing-library----e3a274307e65.html -o output -t template.js 
    $ medium2gatsby ~/Downloads/medium-export/posts -o . -t template.js 
```

## Recommended styling
### Images and subtitles
Images and subtitles will been converted to
`<figure><img><figcaption>Subtitle</figcaption>` same as medium used.

Gatsby injects a `<p>` in there. To fix spacing I suggest you add the following to your template's
CSS:`figure > p {margin-bottom:0px !important;}`.

You can use `figure figcaption {}` to style image subtitles.

### Fenced Links
If you used fenced links on medium to make links stand out, those links will now
have show up as `<a href="some-link" class="fenced-link">some text</a>.` This
CSS should approximate the medium fenced link style:
```css
.fenced-link {
  background-color:#0000000d;
  font-family:monospace;  
  text-decoration:underline;
  padding:2px;
}
```



## Customize via templates
Based on which gatsby theme you're using you may need to generate different
frontmatter fields.

Here are some example `template.js` you can save and pass to the CLI via the `-t` flag.

### Template ex1: Different folder for each post 
- specifies `2018-04-16` date format in frontmatter `date` field
- generates a separate folder for each post ie: `content/posts/introducing-react/index.md
- saves post images to `/images2` (relative to the post folder)
- posts will show on site as `/posts/[slug-name]`
- defauls all code fences to use `'js'`

```js
module.exports = {
  render: function(data) {
    // data.published is Date ISO format: 2018-04-16T14:48:00.000Z
    var date = new Date(data.published);
    var prettyDate =
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1).toString().padStart(2, 0) +
      '-' +
      date
        .getDate()
        .toString()
        .padStart(2, 0); //2018-04-16
    
    var template = `\
---
slug: "/posts/${data.titleForSlug}/"
date: ${prettyDate}
title: "${data.title}"
draft: false
description: "${data.description}"
categories: []
keywords: [${data.tags.join(',')}]
---

${data.body}
`;

    return template;
  },
  getOptions: function() {
    return {
      folderForEachSlug: true, // separate folder for each blog post, where index.md and post images will live
      imagePath: '/images2', // <img src="/images2/[filename]" >. Used in the markdown files.
      defaultCodeBlockLanguage: 'js', // code fenced by default will be ``` with no lang. If most of your code blocks are in a specific lang, set this here.
    };
  },
};

```

### Template ex2: Same folder for all posts
- specifies `2018-04-16T14:48:00.000Z` date format (ISO, which is default) in frontmatter `date` field
- saves all generated posts to same folder defined in `-o` options for CLI. Files are named via slug name from medium.
- saves post images to `/Users/jacharles/dev/blog/content/posts/introducing-the-react-testing-library/images`
- defauls all code fences to use `''` (no language).

```js
module.exports = {
  render: function(data) {
    var template = `\
---
slug: ${data.titleForSlug}
date: ${data.published}
title: "${data.title}"
template: "post"
draft: false
description: "${data.description}"
category: ""
tags: [${data.tags.join(',')}]
---

${data.body}
`;

    return template;
  },
  getOptions: function() {
    return {
      folderForEachSlug: false, // same folder for all posts
      imagePath: '/media', // <img src="/media/[filename]" >. Used in the markdown files.
      // This field is ignored when folderForEachSlug:true. Should be absolute. Location where medium images will be saved.
      imageFolder:
        '/Users/jacharles/dev/blog/static/media', 
      defaultCodeBlockLanguage: '', // code fenced by default will be ``` with no lang. If most of your code blocks are in a specific lang, set this here.
    };
  },
};

```

## TODO and Help needed
I'm about ready to move on from this, but would love help with the following if
anybody feels inclined:
- [ ] Better progress / error messages. Should notify which articles fail for whichever reason
- [ ] Error handling is very lacking in many places. Could / should be improved to be more robust especially around downloading posts / images from medium.
- [ ] Adding tests (prefer something dead simple like mocha). Currently there
    are zero tests.
- [ ] More generator targets. This repo could fairly easily be forked and expanded to include other targets like jekyll, or
    other static site generators. (low priority) (medium2markdown)
