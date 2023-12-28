/**
 * MIT License
 *
 * Copyright (c) 2023, Brion Mario
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

import fs from 'fs';
import path from 'path';
import {
  DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME,
  DEFAULT_MEDMARK_FOLDER_NAME,
  DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME,
  DEFAULT_TEMPLATES_FOLDER_NAME,
} from './constants';
import output from './output';

function init(): void {
  try {
    output.addNewline();
    output.log({
      title: '🚀 Initializing Medmark...',
    });

    const medmarkDir: string = path.join(process.cwd(), DEFAULT_MEDMARK_FOLDER_NAME);
    const mediumExportDir: string = path.join(medmarkDir, DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME);
    const templatesDir: string = path.join(medmarkDir, DEFAULT_TEMPLATES_FOLDER_NAME);
    const sampleTemplateFile: string = path.join(templatesDir, DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME);

    // Create the .medmark folder
    if (!fs.existsSync(medmarkDir)) {
      fs.mkdirSync(medmarkDir);
      output.log({bodyLines: [output.check({text: `${DEFAULT_MEDMARK_FOLDER_NAME} folder created.`})]});
    } else {
      output.log({bodyLines: [output.skip({text: `${DEFAULT_MEDMARK_FOLDER_NAME} folder already exists.`})]});
    }

    // Create the medium-export folder and .gitkeep file
    if (!fs.existsSync(mediumExportDir)) {
      fs.mkdirSync(mediumExportDir);
      fs.writeFileSync(path.join(mediumExportDir, '.gitkeep'), '');
      output.log({bodyLines: [output.check({text: `${DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME} folder created.`})]});
    } else {
      output.log({bodyLines: [output.skip({text: `${DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME} folder already exists.`})]});
    }

    // Create the templates folder
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir);
      output.log({bodyLines: [output.check({text: `${DEFAULT_TEMPLATES_FOLDER_NAME} folder created.`})]});
    } else {
      output.log({bodyLines: [output.skip({text: `${DEFAULT_TEMPLATES_FOLDER_NAME} folder already exists.`})]});
    }

    // Create the sample-template.js file with content
    const sampleTemplateContent: string = `\
const { frontMatterToYaml } = require('medmark');

module.exports = {
  getOptions() {
    return {
      defaultCodeBlockLanguage: 'js',
      folderForEachSlug: true,
      imagePath: '/resources',
      imageStorageStrategy: 'REMOTE',
    };
  },

  render(data) {
    const date = new Date(data.published);
    const prettyDate = \`\${date.getFullYear()}-\${(date.getMonth() + 1).toString().padStart(2, 0)}-\${date.getDate().toString().padStart(2, 0)}\`;

    const frontMatterAsJSON = {
      slug: \`/posts/\${data.titleForSlug}/\`,
      date: prettyDate,
      title: data.title,
      description: data.description,
      authors: data.authors,
      readingTime: data.readingTime,
      draft: data.draft,
      categories: data.categories,
      tags: data.tags,
      bannerImage: data.images.map(image => image.mediumUrl)[0],
      ogImage: data.images.map(image => image.mediumUrl)[0],
      images: data.images.map(image => image.mediumUrl),
    };

    const frontMatter = \`\\
---
\${frontMatterToYaml(frontMatterAsJSON)}
---

\${data.body}
\`;

    return frontMatter;
  },
};
`;

    if (!fs.existsSync(sampleTemplateFile)) {
      fs.writeFileSync(sampleTemplateFile, sampleTemplateContent);
      output.log({bodyLines: [output.check({text: `${DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME} file created.`})]});
    } else {
      output.log({
        bodyLines: [output.skip({text: `${DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME} file already exists.`})],
      });
    }

    output.success({
      title: '🎉 Initialization completed successfully.',
    });
  } catch (error) {
    output.error({
      bodyLines: [error.message.toString()],
      title: '❌ Initialization failed.',
    });
  }
}

export default init;
