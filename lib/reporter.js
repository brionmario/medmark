/**
 * MIT License
 *
 * Copyright (c) 2023, Brion Mario.
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

const fs = require('fs-extra');
const path = require('path');

const Reporter = (function () {
  let instance;
  const report = {
    gists: {
      attempted: [],
      failed: [],
      succeeded: [],
    },
    images: {
      attempted: [],
      failed: [],
      succeeded: [],
    },
    posts: {
      attempted: [],
      drafts: [],
      failed: [],
      replies: [],
      succeeded: [],
    },
  };

  function createInstance() {
    const object = {
      printPrettyReport() {
        const _report = {
          drafts: {
            attempted: report.posts.drafts.length,
          },
          gists: {
            attempted: report.gists.attempted.length,
            failed: report.gists.failed.length,
            failureReasons: report.gists.failed,
            succeeded: report.gists.succeeded.length,
          },
          images: {
            attempted: report.images.attempted.length,
            failed: report.images.failed.length,
            failureReasons: report.images.failed,
            succeeded: report.images.succeeded.length,
          },
          posts: {
            attempted: report.posts.attempted.length,
            failed: report.posts.failed.length,
            failureReasons: report.posts.failed,
            succeeded: report.posts.succeeded.length,
          },
          replied: {
            attempted: report.posts.replies.length,
          },
        };

        console.table(_report);
      },
      report,
      saveReportToFile(outputFolder) {
        fs.writeFileSync(path.join(outputFolder, 'conversion_report.json'), JSON.stringify(report));
      },
    };

    return object;
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }

      return instance;
    },
  };
})();

module.exports = Reporter;
