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
- [Install](#install)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributors](#contributors)
- [License](#license)

# Inspiration

This project is inspired by [export-medium-to-gatsby](https://github.com/jamischarles/export-medium-to-gatsby), a tool to export Medium articles to Gatsby.js. However, the last update to `export-medium-to-gatsby` was made on Mar 11, 2021 and seems it's unmaintained. I got several issues trying to convert my blogs so I decided to fork and improve the code.

Hence, I decided to fork the repo and improve the code and fix the issues I encountered. I also added some features that I think would be useful for me and other users.

💡 I primarily use this to create my own personal blog (https://brionmario.com/blog)

## Prerequisites

### Software

Before you get started, make sure you have the following installed:

- [Node.js](https://nodejs.org/en/) (LTS version is recommended)
- [npm](https://www.npmjs.com/get-npm)

### Medium Archive

Before you can use this tool, you need to export your Medium archive. To export your archive, follow these steps:

1. Go to [Medium Settings](https://medium.com/me/settings)
2. Scroll down to the "Download your information" section
3. Click "Download" button
4. Enter your password to verify your identity
5. Wait for the email from Medium with the subject "Your Medium export is ready"
6. Download the export file

## Install

You can use medmark with `npx`(https://www.npmjs.com/package/npx) without having to install it:

```bash
npx medmark
```

Alternatively, you can install it globally:

```bash
npm install -g medmark
# Run it
medmark
```

Or install it locally in your project:

```bash
npm install medmark
# Run it
npx medmark
```

## Usage

Based on your install method, you can run medmark:

```bash
npx medmark
```

After running the above command, you will be prompted for the following:

1. Path to the posts folder of the Medium exported archive.
2. Destination folder for output files (default is ./output).
3. Path to the template file (optional).
4. Whether to export drafts as well (default is false).
5. Comma-separated list of files to skip (optional).
6. Whether to run the tool in debug mode (default is true).

Once you have provided the required information, the tool will convert your Medium archive to markdown files and save them to the specified output folder.

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--input <path_to_posts_folder>` | `-i` | Path to the folder containing posts from the medium export |
| `--output <destination_folder>` | `-o` | Destination folder for output files. Defaults to "output" |
| `--template <template_file>` | `-t` | Template used to generate post files |
| `--drafts` | `-d` | Set flag to export drafts along with other posts |
| `--skip <comma_separated_files>` | `-s` | Comma-separated list of files to skip |
| `--debug` | `-D` | Set flag to run the tool in debug mode |

## Template

By default, the tool generates markdown files with the following structure:

```yaml
---
slug: "/your-post-slug/"
date: "2023-05-01"
title: "Your Post Title"
description: "Your post description"
authors:
  - bio: "Your bio"
    id: "your-id"
    image: "https://your-image-url.com"
    name: "Your Name"
    twitterScreenName: "your-twitter-handle"
    username: "your-username"
readingTime: "x min read"
draft: false
tags:
  - "tag1"
  - "tag2"
  - "tag3"
bannerImage: "https://your-banner-image-url.com"
ogImage: "https://your-og-image-url.com"
images:
  - "https://your-image1-url.com"
  - "https://your-image2-url.com"
  - "https://your-image3-url.com"
  - "https://your-image4-url.com"
  - "https://your-image5-url.com"

---

<BLOG CONTENT>
```

### Custom Template

You can also write your own template if you need more customizations for the front-matter, etc. The created custom template can be passed to the `--template` argument in the CLI.

To create a custom template, create a JavaScript file that exports an object with two functions:


```js
const {frontMatterToYaml} = require('medmark');

module.exports = {
  /**
   * Returns an object with default options for rendering markdown.
   * @returns {Object} Object containing default options.
   */
  getOptions() {
    return {
      defaultCodeBlockLanguage: 'js', // Set default language for code blocks.
      folderForEachSlug: true, // Create a separate folder for each blog post.
      imagePath: '/resources', // Path for images referenced in markdown files.
      imageStorageStrategy: 'REMOTE', // Where to store images.
      // Add more custom options as needed.
    };
  },

  /**
   * Takes a data object and returns a string of front matter and markdown body.
   * @param {Object} data Data object containing blog post information.
   * @returns {string} String containing front matter and markdown.
   */
  render(data) {
    // Convert published date to YYYY-MM-DD format.
    const date = new Date(data.published);
    const prettyDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date
      .getDate()
      .toString()
      .padStart(2, 0)}`;

    /* eslint-disable sort-keys */
    const frontMatterAsJSON = {
      slug: data.slug,
      date: prettyDate,
      title: data.title,
      description: data.description,
      authors: data.authors,
      readingTime: data.readingTime,
      draft: data.draft,
      tags: data.tags,
      bannerImage: data.bannerImage,
      ogImage: data.ogImage,
      images: data.images,
      // Add more custom front matter fields as needed.
    };
    /* eslint-enable sort-keys */

    const frontMatter = `\
---
${frontMatterToYaml(frontMatterAsJSON)}
---

${data.body}
`;

    return frontMatter;
  },
};
```

The `getOptions` function returns an object with default options for rendering markdown, such as the default language for code blocks, the path for images referenced in markdown files, etc.

The `render` function takes a data object containing blog post information, and returns a string of front matter and markdown body. The front matter should be formatted in YAML syntax.

Once you've created your custom template, you can pass its path to the `--template` argument in the CLI:

```bash
npx medmark --input medium-export/posts --output output --template path/to/custom/template.js
```

## Contributing

Want to report a bug, contribute some code, or improve the documentation?

Excellent! Read up on our [guidelines for contributing](./CONTRIBUTING.md) to get started.

## Badge

If you use Medmark in your own projects, you can choose to add the following badge to your README file to acknowledge its usage. Please note that this is totally optional 😜.

![Medmark](https://img.shields.io/badge/Content_Powered_By-Medmark-yellow?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA1NSA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4MzZfMikiPgo8cGF0aCBkPSJNNDMuODUgMzYuNTVDNDMuODUgMzcuMDUgNDQuMDE2NyAzNy40NSA0NC4zNSAzNy43NUw0Ny42NSA0MC45VjQxSDMxVjQwLjlMMzQuMzUgMzcuNzVDMzQuNjUgMzcuNDUgMzQuOCAzNy4wNSAzNC44IDM2LjU1VjE2LjQ1QzM0LjggMTUuNDUgMzQuODUgMTQuNDUgMzQuOTUgMTMuNDVMMjMuNjUgNDEuNEgyMy41NUwxMS44NSAxNS43QzExLjM1IDE0LjY2NjcgMTEuMDMzMyAxMy45MzMzIDEwLjkgMTMuNVYzMi42QzEwLjkgMzMuMSAxMS4xMTY3IDMzLjY1IDExLjU1IDM0LjI1TDE2LjYgNDAuOVY0MUg0LjE1VjQwLjlMOS4yIDM0LjI1QzkuNjMzMzMgMzMuNjUgOS44NSAzMy4xIDkuODUgMzIuNlYxMi44QzkuODUgMTIuMiA5LjcgMTEuNzE2NyA5LjQgMTEuMzVMNS4zIDUuOTVWNS44NUgxNy4yNUwyNy43IDI4LjY1TDM2LjkgNS44NUg0Ny42NVY1Ljk1TDQ0LjM1IDkuNkM0NC4wMTY3IDkuOTMzMzMgNDMuODUgMTAuMzUgNDMuODUgMTAuODVWMzYuNTVaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c%2BCjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE4MzZfMiI%2BCjxyZWN0IHdpZHRoPSI1NSIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K)

#### URL

```html
https://img.shields.io/badge/Content_Powered_By-Medmark-yellow?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA1NSA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4MzZfMikiPgo8cGF0aCBkPSJNNDMuODUgMzYuNTVDNDMuODUgMzcuMDUgNDQuMDE2NyAzNy40NSA0NC4zNSAzNy43NUw0Ny42NSA0MC45VjQxSDMxVjQwLjlMMzQuMzUgMzcuNzVDMzQuNjUgMzcuNDUgMzQuOCAzNy4wNSAzNC44IDM2LjU1VjE2LjQ1QzM0LjggMTUuNDUgMzQuODUgMTQuNDUgMzQuOTUgMTMuNDVMMjMuNjUgNDEuNEgyMy41NUwxMS44NSAxNS43QzExLjM1IDE0LjY2NjcgMTEuMDMzMyAxMy45MzMzIDEwLjkgMTMuNVYzMi42QzEwLjkgMzMuMSAxMS4xMTY3IDMzLjY1IDExLjU1IDM0LjI1TDE2LjYgNDAuOVY0MUg0LjE1VjQwLjlMOS4yIDM0LjI1QzkuNjMzMzMgMzMuNjUgOS44NSAzMy4xIDkuODUgMzIuNlYxMi44QzkuODUgMTIuMiA5LjcgMTEuNzE2NyA5LjQgMTEuMzVMNS4zIDUuOTVWNS44NUgxNy4yNUwyNy43IDI4LjY1TDM2LjkgNS44NUg0Ny42NVY1Ljk1TDQ0LjM1IDkuNkM0NC4wMTY3IDkuOTMzMzMgNDMuODUgMTAuMzUgNDMuODUgMTAuODVWMzYuNTVaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c%2BCjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE4MzZfMiI%2BCjxyZWN0IHdpZHRoPSI1NSIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K
```

#### Markdown

```md
![Static Badge](https://img.shields.io/badge/Content_Powered_By-Medmark-yellow?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA1NSA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4MzZfMikiPgo8cGF0aCBkPSJNNDMuODUgMzYuNTVDNDMuODUgMzcuMDUgNDQuMDE2NyAzNy40NSA0NC4zNSAzNy43NUw0Ny42NSA0MC45VjQxSDMxVjQwLjlMMzQuMzUgMzcuNzVDMzQuNjUgMzcuNDUgMzQuOCAzNy4wNSAzNC44IDM2LjU1VjE2LjQ1QzM0LjggMTUuNDUgMzQuODUgMTQuNDUgMzQuOTUgMTMuNDVMMjMuNjUgNDEuNEgyMy41NUwxMS44NSAxNS43QzExLjM1IDE0LjY2NjcgMTEuMDMzMyAxMy45MzMzIDEwLjkgMTMuNVYzMi42QzEwLjkgMzMuMSAxMS4xMTY3IDMzLjY1IDExLjU1IDM0LjI1TDE2LjYgNDAuOVY0MUg0LjE1VjQwLjlMOS4yIDM0LjI1QzkuNjMzMzMgMzMuNjUgOS44NSAzMy4xIDkuODUgMzIuNlYxMi44QzkuODUgMTIuMiA5LjcgMTEuNzE2NyA5LjQgMTEuMzVMNS4zIDUuOTVWNS44NUgxNy4yNUwyNy43IDI4LjY1TDM2LjkgNS44NUg0Ny42NVY1Ljk1TDQ0LjM1IDkuNkM0NC4wMTY3IDkuOTMzMzMgNDMuODUgMTAuMzUgNDMuODUgMTAuODVWMzYuNTVaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c%2BCjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE4MzZfMiI%2BCjxyZWN0IHdpZHRoPSI1NSIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K)
```

#### rSt

```rst
.. image:: https://img.shields.io/badge/Content_Powered_By-Medmark-yellow?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA1NSA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4MzZfMikiPgo8cGF0aCBkPSJNNDMuODUgMzYuNTVDNDMuODUgMzcuMDUgNDQuMDE2NyAzNy40NSA0NC4zNSAzNy43NUw0Ny42NSA0MC45VjQxSDMxVjQwLjlMMzQuMzUgMzcuNzVDMzQuNjUgMzcuNDUgMzQuOCAzNy4wNSAzNC44IDM2LjU1VjE2LjQ1QzM0LjggMTUuNDUgMzQuODUgMTQuNDUgMzQuOTUgMTMuNDVMMjMuNjUgNDEuNEgyMy41NUwxMS44NSAxNS43QzExLjM1IDE0LjY2NjcgMTEuMDMzMyAxMy45MzMzIDEwLjkgMTMuNVYzMi42QzEwLjkgMzMuMSAxMS4xMTY3IDMzLjY1IDExLjU1IDM0LjI1TDE2LjYgNDAuOVY0MUg0LjE1VjQwLjlMOS4yIDM0LjI1QzkuNjMzMzMgMzMuNjUgOS44NSAzMy4xIDkuODUgMzIuNlYxMi44QzkuODUgMTIuMiA5LjcgMTEuNzE2NyA5LjQgMTEuMzVMNS4zIDUuOTVWNS44NUgxNy4yNUwyNy43IDI4LjY1TDM2LjkgNS44NUg0Ny42NVY1Ljk1TDQ0LjM1IDkuNkM0NC4wMTY3IDkuOTMzMzMgNDMuODUgMTAuMzUgNDMuODUgMTAuODVWMzYuNTVaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c%2BCjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE4MzZfMiI%2BCjxyZWN0IHdpZHRoPSI1NSIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K
:   alt: Static Badge
```

#### AsciiDoc

```html
image:https://img.shields.io/badge/Content_Powered_By-Medmark-yellow?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA1NSA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4MzZfMikiPgo8cGF0aCBkPSJNNDMuODUgMzYuNTVDNDMuODUgMzcuMDUgNDQuMDE2NyAzNy40NSA0NC4zNSAzNy43NUw0Ny42NSA0MC45VjQxSDMxVjQwLjlMMzQuMzUgMzcuNzVDMzQuNjUgMzcuNDUgMzQuOCAzNy4wNSAzNC44IDM2LjU1VjE2LjQ1QzM0LjggMTUuNDUgMzQuODUgMTQuNDUgMzQuOTUgMTMuNDVMMjMuNjUgNDEuNEgyMy41NUwxMS44NSAxNS43QzExLjM1IDE0LjY2NjcgMTEuMDMzMyAxMy45MzMzIDEwLjkgMTMuNVYzMi42QzEwLjkgMzMuMSAxMS4xMTY3IDMzLjY1IDExLjU1IDM0LjI1TDE2LjYgNDAuOVY0MUg0LjE1VjQwLjlMOS4yIDM0LjI1QzkuNjMzMzMgMzMuNjUgOS44NSAzMy4xIDkuODUgMzIuNlYxMi44QzkuODUgMTIuMiA5LjcgMTEuNzE2NyA5LjQgMTEuMzVMNS4zIDUuOTVWNS44NUgxNy4yNUwyNy43IDI4LjY1TDM2LjkgNS44NUg0Ny42NVY1Ljk1TDQ0LjM1IDkuNkM0NC4wMTY3IDkuOTMzMzMgNDMuODUgMTAuMzUgNDMuODUgMTAuODVWMzYuNTVaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c%2BCjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE4MzZfMiI%2BCjxyZWN0IHdpZHRoPSI1NSIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K[Static Badge]
```

#### HTML

```html
<img alt="Static Badge" src="https://img.shields.io/badge/Content_Powered_By-Medmark-yellow?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA1NSA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4MzZfMikiPgo8cGF0aCBkPSJNNDMuODUgMzYuNTVDNDMuODUgMzcuMDUgNDQuMDE2NyAzNy40NSA0NC4zNSAzNy43NUw0Ny42NSA0MC45VjQxSDMxVjQwLjlMMzQuMzUgMzcuNzVDMzQuNjUgMzcuNDUgMzQuOCAzNy4wNSAzNC44IDM2LjU1VjE2LjQ1QzM0LjggMTUuNDUgMzQuODUgMTQuNDUgMzQuOTUgMTMuNDVMMjMuNjUgNDEuNEgyMy41NUwxMS44NSAxNS43QzExLjM1IDE0LjY2NjcgMTEuMDMzMyAxMy45MzMzIDEwLjkgMTMuNVYzMi42QzEwLjkgMzMuMSAxMS4xMTY3IDMzLjY1IDExLjU1IDM0LjI1TDE2LjYgNDAuOVY0MUg0LjE1VjQwLjlMOS4yIDM0LjI1QzkuNjMzMzMgMzMuNjUgOS44NSAzMy4xIDkuODUgMzIuNlYxMi44QzkuODUgMTIuMiA5LjcgMTEuNzE2NyA5LjQgMTEuMzVMNS4zIDUuOTVWNS44NUgxNy4yNUwyNy43IDI4LjY1TDM2LjkgNS44NUg0Ny42NVY1Ljk1TDQ0LjM1IDkuNkM0NC4wMTY3IDkuOTMzMzMgNDMuODUgMTAuMzUgNDMuODUgMTAuODVWMzYuNTVaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c%2BCjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE4MzZfMiI%2BCjxyZWN0IHdpZHRoPSI1NSIgaGVpZ2h0PSI0OCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K">
```

Happy coding!

## License

Licenses this source under the MIT License, Version 2.0 [LICENSE](./LICENSE), You may not use this file except in compliance with the License.
