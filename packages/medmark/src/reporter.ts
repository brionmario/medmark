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

import fs from 'fs-extra';
import path from 'path';

/**
 * Represents a report object with statistics for different types of content.
 */
interface Report {
  /**
   * Contains statistics for gists.
   */
  gists: {
    /**
     * Contains the number of attempted gists.
     */
    attempted: string[];
    /**
     * Contains the number of failed gists.
     */
    failed: string[];
    /**
     * Contains the number of succeeded gists.
     */
    succeeded: string[];
  };
  /**
   * Contains statistics for images.
   */
  images: {
    /**
     * Contains the number of attempted images.
     */
    attempted: string[];
    /**
     * Contains the number of failed images.
     */
    failed: string[];
    /**
     * Contains the number of succeeded images.
     */
    succeeded: string[];
  };
  /**
   * Contains statistics for posts.
   */
  posts: {
    /**
     * Contains the number of attempted posts.
     */
    attempted: string[];
    /**
     * Contains the number of drafts.
     */
    drafts: string[];
    /**
     * Contains the number of failed posts.
     */
    failed: string[];
    /**
     * Contains the number of replies.
     */
    replies: string[];
    /**
     * Contains the number of succeeded posts.
     */
    succeeded: string[];
  };
}

/**
 * The Reporter class is a singleton that can be used to store and output reports on a variety of data types.
 */
class Reporter {
  private static instance: Reporter;

  report: Report;

  private constructor() {
    this.report = {
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
  }

  /**
   * Returns the singleton instance of the Reporter class. If an instance does not exist, it will be created.
   *
   * @returns The Reporter singleton instance.
   */
  static getInstance(): Reporter {
    if (!Reporter.instance) {
      Reporter.instance = new Reporter();
    }

    return Reporter.instance;
  }

  /**
   * Outputs the current report in a pretty format to the console.
   */
  printPrettyReport(): void {
    // eslint-disable-next-line no-console
    console.table({
      drafts: {
        attempted: this.report.posts.drafts.length,
      },
      gists: {
        attempted: this.report.gists.attempted.length,
        failed: this.report.gists.failed.length,
        failureReasons: this.report.gists.failed,
        succeeded: this.report.gists.succeeded.length,
      },
      images: {
        attempted: this.report.images.attempted.length,
        failed: this.report.images.failed.length,
        failureReasons: this.report.images.failed,
        succeeded: this.report.images.succeeded.length,
      },
      posts: {
        attempted: this.report.posts.attempted.length,
        failed: this.report.posts.failed.length,
        failureReasons: this.report.posts.failed,
        succeeded: this.report.posts.succeeded.length,
      },
      replied: {
        attempted: this.report.posts.replies.length,
      },
    });
  }

  /**
   * Saves the current report to a file in JSON format.
   *
   * @param outputFolder - The folder where the report file should be saved.
   */
  saveReportToFile(outputFolder: string): void {
    fs.writeFileSync(path.join(outputFolder, 'conversion_report.json'), JSON.stringify(this.report));
  }
}

export default Reporter;
