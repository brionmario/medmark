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
import {log} from '@clack/prompts';
import {
  DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME,
  DEFAULT_MEDMARK_FOLDER_NAME,
  DEFAULT_MEDMARK_HIDDEN_FOLDER_NAME,
  DEFAULT_MEDMARK_LOGS_FOLDER_NAME,
  DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME,
  DEFAULT_TEMPLATES_FOLDER_NAME,
} from './constants';

function ensureDir(dirPath: string, label: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true});
    log.step(`Created ${label}`);
  }
}

async function init(): Promise<void> {
  try {
    const cwd: string = process.cwd();

    const medmarkDir: string = path.join(cwd, DEFAULT_MEDMARK_FOLDER_NAME);
    const mediumExportDir: string = path.join(medmarkDir, DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME);
    const templatesDir: string = path.join(medmarkDir, DEFAULT_TEMPLATES_FOLDER_NAME);
    const sampleTemplateFile: string = path.join(templatesDir, DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME);

    const hiddenDir: string = path.join(cwd, DEFAULT_MEDMARK_HIDDEN_FOLDER_NAME);
    const logsDir: string = path.join(hiddenDir, DEFAULT_MEDMARK_LOGS_FOLDER_NAME);

    ensureDir(medmarkDir, `${DEFAULT_MEDMARK_FOLDER_NAME}/`);
    ensureDir(mediumExportDir, `${DEFAULT_MEDMARK_FOLDER_NAME}/${DEFAULT_MEDIUM_EXPORTS_FOLDER_NAME}/`);
    ensureDir(templatesDir, `${DEFAULT_MEDMARK_FOLDER_NAME}/${DEFAULT_TEMPLATES_FOLDER_NAME}/`);
    ensureDir(hiddenDir, `${DEFAULT_MEDMARK_HIDDEN_FOLDER_NAME}/`);
    ensureDir(logsDir, `${DEFAULT_MEDMARK_HIDDEN_FOLDER_NAME}/${DEFAULT_MEDMARK_LOGS_FOLDER_NAME}/`);

    if (!fs.existsSync(path.join(mediumExportDir, '.gitkeep'))) {
      fs.writeFileSync(path.join(mediumExportDir, '.gitkeep'), '');
    }

    const sampleTemplateContent: string = `\
const { frontMatterToYaml, buildDefaultRegistryEntry, serializeDefaultRegistry } = require('medmark');

module.exports = {
  getOptions() {
    return {
      defaultCodeBlockLanguage: 'js',
      folderForEachSlug: true,
      imagePath: '/resources',
      imageStorageStrategy: 'REMOTE',
      // Generate a machine-readable index of every post that was converted.
      registry: {
        enabled: true,
        // 'json' -> registry.json, 'ts' -> registry.ts, 'rss' -> feed.xml, 'sitemap' -> sitemap.xml
        formats: ['json'],
        // 'rss' and 'sitemap' require \`site.url\`.
        // site: { url: 'https://example.com', title: 'My Blog', description: '...' },
      },
    };
  },

  // OPTIONAL: customize what gets recorded per post in the registry.
  // Omit to use the built-in default entry shape.
  buildRegistryEntry(data, context) {
    return buildDefaultRegistryEntry(data, context);
  },

  // OPTIONAL: customize how the registry is serialized to disk.
  // Omit to use the built-in serializers driven by \`options.registry.formats\`.
  serializeRegistry(registry, context) {
    return serializeDefaultRegistry(registry, context);
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
      log.step(`Created ${DEFAULT_MEDMARK_FOLDER_NAME}/${DEFAULT_TEMPLATES_FOLDER_NAME}/${DEFAULT_MEDMARK_TEMPLATE_SAMPLE_FILENAME}`);
    }

    log.success('Workspace initialized.');
  } catch (error) {
    log.error(`Initialization failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

export default init;
