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

module.exports = {
  render: function (data) {
    // date is ISO format

    var template = `\
---
title: "${data.title}"
date: ${data.published}
template: "post"
draft: false
slug: "/posts/${data.titleForSlug}/"
category: ""
tags: [${data.tags.join(',')}]
description: "${data.description}"
---

${data.body}
`;

    // FIXME: list example of output here...
    return template;
  },
  getOptions: function () {
    return {
      folderForEachSlug: false, // same folder for all posts
      imagePath: '/media', // <img src="/media/[filename]" >. Used in the markdown files.
      // This field is ignored when folderForEachSlug:true. Should be absolute. Location where medium images will be saved.
      imageFolder: '/Users/dummy/blog/static/media',
      defaultCodeBlockLanguage: '', // code fenced by default will be ``` with no lang. If most of your code blocks are in a specific lang, set this here.
    };
  },
};
