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

import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {DEFAULT_MEDMARK_HIDDEN_FOLDER_NAME, MEDIUM_EXPORT_POSTS_FOLDER_NAME} from './constants';

/**
 * Where a `.zip` export is unpacked before it is read.
 */
const EXTRACTED_FOLDER_NAME: string = 'extracted';

/**
 * Does this folder hold the exported posts themselves?
 *
 * Medium names them `<date>_<title>-<hash>.html`, but anything ending in
 * `.html` is enough to tell a `posts/` folder from its parent.
 * @param dir - Absolute path to check.
 * @returns Whether the folder directly contains `.html` files.
 */
const holdsPosts = (dir: string): boolean => {
  try {
    return fs.readdirSync(dir).some((entry: string) => entry.toLowerCase().endsWith('.html'));
  } catch {
    return false;
  }
};

/**
 * Unpack a `.zip` next to the workspace and return the folder it unpacked into.
 *
 * `tar` reads zip archives and ships with macOS, Linux and Windows 10 or later,
 * so this avoids a dependency for something most people only do once. If it is
 * missing, say so plainly rather than failing on a cryptic spawn error: unzipping
 * by hand and passing the folder works just as well.
 * @param zipPath - Absolute path to the archive.
 * @param cwd - Directory the command is running in.
 * @returns Absolute path to the unpacked folder.
 */
const unpack = (zipPath: string, cwd: string): string => {
  const destination: string = path.join(
    cwd,
    DEFAULT_MEDMARK_HIDDEN_FOLDER_NAME,
    EXTRACTED_FOLDER_NAME,
    path.basename(zipPath, path.extname(zipPath)),
  );

  fs.rmSync(destination, {force: true, recursive: true});
  fs.mkdirSync(destination, {recursive: true});

  try {
    execFileSync('tar', ['-xf', zipPath, '-C', destination], {stdio: 'ignore'});
  } catch {
    throw new Error(
      `Could not unpack ${zipPath}. Unzip it yourself and pass the folder instead, ` +
        'or install `tar` if your system does not have it.',
    );
  }

  return destination;
};

/**
 * Unpack a path we know is a file, rejecting anything that is not a `.zip`.
 * @param file - Absolute path to the file.
 * @param cwd - Directory the command is running in.
 * @returns Absolute path to the unpacked folder.
 */
const unpackArchive = (file: string, cwd: string): string => {
  if (path.extname(file).toLowerCase() !== '.zip') {
    throw new Error(`Expected a folder or a .zip archive, but got a file: ${file}`);
  }

  return unpack(file, cwd);
};

/**
 * Clean up a path a person typed, pasted or dragged in.
 *
 * Dragging a file into a terminal inserts it the way a shell needs it: wrapped
 * in quotes, or with its spaces backslash-escaped. A prompt is not a shell, so
 * those characters survive into the answer and a perfectly good absolute path
 * stops being absolute, then gets joined onto the working directory.
 * @param value - Whatever the user gave us.
 * @returns The path without shell quoting or escaping.
 */
export const normalisePathInput = (value: string): string => {
  const trimmed: string = value.trim();

  const quote: string = trimmed.slice(0, 1);
  if ((quote === "'" || quote === '"') && trimmed.endsWith(quote) && trimmed.length > 1) {
    const inner: string = trimmed.slice(1, -1);

    // Single quotes are literal in a shell; double quotes still allow escapes.
    return quote === '"' ? inner.replace(/\\(["\\$`])/g, '$1') : inner;
  }

  // Unquoted drags escape the awkward characters instead.
  return trimmed.replace(/\\(.)/g, '$1');
};

/**
 * Find the folder of exported posts, given whatever the user pointed us at.
 *
 * People reach for the thing Medium emailed them, not the folder three levels
 * inside it, so accept any of these and work out the rest:
 *
 * - `medium-export.zip`, straight from the email
 * - the unzipped export root, which holds `posts/` beside `profile/`, `lists/` and friends
 * - the `posts/` folder itself, for anyone who already knows where it lives
 * @param input - Path the user gave, absolute or relative to `cwd`.
 * @param cwd - Directory the command is running in.
 * @returns Absolute path to the folder holding the exported `.html` posts.
 */
const resolveMediumExport = (input: string, cwd: string): string => {
  const resolved: string = path.resolve(cwd, normalisePathInput(input));

  if (!fs.existsSync(resolved)) {
    throw new Error(`Path not found: ${resolved}`);
  }

  const root: string = fs.statSync(resolved).isFile() ? unpackArchive(resolved, cwd) : resolved;

  // The export root, holding `posts/` beside the other folders Medium includes.
  // Check this before the folder itself: an export root also has `README.html`
  // and `ips.html` sitting at the top level, so a folder holding `.html` files
  // is not proof that it is the posts folder.
  const nested: string = path.join(root, MEDIUM_EXPORT_POSTS_FOLDER_NAME);
  if (fs.existsSync(nested) && holdsPosts(nested)) {
    return nested;
  }

  // The posts folder itself.
  if (holdsPosts(root)) {
    return root;
  }

  // A zip usually unpacks into a single wrapper folder, so look one level down too.
  const oneLevelDown: string | undefined = ((): string | undefined => {
    try {
      return fs
        .readdirSync(root, {withFileTypes: true})
        .filter((entry: fs.Dirent) => entry.isDirectory())
        .map((entry: fs.Dirent) => path.join(root, entry.name, MEDIUM_EXPORT_POSTS_FOLDER_NAME))
        .find((candidate: string) => fs.existsSync(candidate) && holdsPosts(candidate));
    } catch {
      return undefined;
    }
  })();

  if (oneLevelDown) {
    return oneLevelDown;
  }

  throw new Error(
    `No exported posts found in ${resolved}. Point medmark at your Medium export: ` +
      'the `.zip` Medium emailed you, the folder you unzipped it to, or the `posts` folder inside it.',
  );
};

export default resolveMediumExport;
