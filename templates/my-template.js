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
      imagePath: '/resources', // <img src="/images2/[filename]" >. Used in the markdown files.
      defaultCodeBlockLanguage: 'js', // code fenced by default will be ``` with no lang. If most of your code blocks are in a specific lang, set this here.
      imageStorageStrategy: 'REMOTE' // Where should be images be stored?
    };
  },
};
