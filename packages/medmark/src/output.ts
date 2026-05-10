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

import chalk, {ChalkInstance} from 'chalk';
import {EOL} from 'os';

export interface CLIErrorMessageConfig {
  /**
   * An array of strings representing the body of the error message.
   */
  bodyLines?: string[];
  /**
   * A short identifier for the error message, e.g. an error code or slug.
   */
  slug?: string;
  /**
   * The title of the error message.
   */
  title: string;
}

export interface CLIWarnMessageConfig {
  /**
   * An array of strings representing the body of the warning message.
   */
  bodyLines?: string[];
  /**
   * A short identifier for the warning message, e.g. a warning code or slug.
   */
  slug?: string;
  /**
   * The title of the warning message.
   */
  title: string;
}

export interface CLINoteMessageConfig {
  /**
   * An array of strings representing the body of the note message.
   */
  bodyLines?: string[];
  /**
   * The title of the note message.
   */
  title: string;
}

export interface CLISuccessMessageConfig {
  /**
   * An array of strings representing the body of the success message.
   */
  bodyLines?: string[];
  /**
   * The title of the success message.
   */
  title: string;
}

export interface CLILogMessageConfig {
  /**
   * An array of strings representing the body of the log message.
   */
  bodyLines?: string[] | void[];
  /**
   * The title of the log message.
   */
  title?: string;
}

class CLIOutput {
  readonly X_PADDING: string = ' ';

  readonly LIB_NAME: string = 'MEDMARK';

  checkpointCounter: number = 1;

  /**
   * Longer dash character which forms more of a continuous line when place side to side
   * with itself, unlike the standard dash character
   */
  private get VERTICAL_SEPARATOR(): string {
    let divider: string = '';

    for (let i: number = 0; i < process.stdout.columns - this.X_PADDING.length * 2; i++) {
      divider += '\u2014';
    }

    return divider;
  }

  /**
   * Expose some color and other utility functions so that other parts of the codebase that need
   * more fine-grained control of message bodies are still using a centralized
   * implementation.
   */
  colors: {
    cyan: ChalkInstance;
    gray: ChalkInstance;
    green: ChalkInstance;
    red: ChalkInstance;
    white: ChalkInstance;
  } = {
    cyan: chalk.cyan,
    gray: chalk.gray,
    green: chalk.green,
    red: chalk.red,
    white: chalk.white,
  };

  bold: ChalkInstance = chalk.bold;

  underline: ChalkInstance = chalk.underline;

  dim: ChalkInstance = chalk.dim;

  /**
   * Writes a string to standard output.
   * @param str - The string to write to standard output.
   */
  // eslint-disable-next-line class-methods-use-this
  private writeToStdOut(str: string): void {
    process.stdout.write(str);
  }

  /**
   * Writes a title to standard output with the specified color and applies the MEDMARK prefix.
   * @param color - The color to apply to the title.
   * @param title - The text of the title.
   */
  private writeOutputTitle({color, title}: {color: string; title: string}): void {
    this.writeToStdOut(` ${this.applyPrefix(title, color)}${EOL}`);
  }

  /**
   * Writes the optional output body to the response.
   *
   * @param res - The response object to write the body to.
   * @param body - The body to write to the response. If `null` or `undefined`, no body will be written.
   * @returns A Promise that resolves once the body has been written to the response.
   */
  private writeOptionalOutputBody(bodyLines?: string[] | void[]): void {
    if (!bodyLines) {
      return;
    }

    bodyLines.forEach((bodyLine: string | void) => this.writeToStdOut(`       ${bodyLine}${EOL}`));
  }

  /**
   * Returns a string with the library prefix in the specified color followed by the given text.
   * @param text - The text to be appended to the library prefix.
   * @param color - The color of the library prefix. Defaults to 'cyan'.
   * @returns The string with the library prefix and the given text.
   */
  applyPrefix(text: string, color: string = 'cyan'): string {
    let libPrefix: string = '';

    if ((chalk as any)[color]) {
      libPrefix = `${(chalk as any)[color]('>')} ${(chalk as any).reset.inverse.bold[color](` ${this.LIB_NAME} `)}`;
    } else {
      libPrefix = `${chalk.hex(color)('>')} ${chalk.reset.inverse.bold.hex(color)(` ${this.LIB_NAME} `)}`;
    }

    return `${libPrefix}  ${text}`;
  }

  /**
   * Writes a newline to the standard output.
   */
  addNewline(): void {
    this.writeToStdOut(EOL);
  }

  /**
   * Writes a vertical separator to the standard output followed by a newline.
   * @param color - The color of the separator. Defaults to 'gray'.
   */
  addVerticalSeparator(color: string = 'gray'): void {
    this.addNewline();
    this.addVerticalSeparatorWithoutNewLines(color);
    this.addNewline();
  }

  /**
   * Writes a vertical separator to the standard output without adding a newline.
   * @param color - The color of the separator. Defaults to 'gray'.
   */
  addVerticalSeparatorWithoutNewLines(color: string = 'gray'): void {
    this.writeToStdOut(`${this.X_PADDING}${(chalk as any).dim[color](this.VERTICAL_SEPARATOR)}${EOL}`);
  }

  /**
   * Writes a single-line log message to the standard output.
   * @param message - The message to be logged.
   */
  logSingleLine(message: string): void {
    this.addNewline();

    this.writeOutputTitle({
      color: 'gray',
      title: message,
    });

    this.addNewline();
  }

  /**
   * Writes a checkpoint announcement to the standard output.
   * @param checkpoint - The checkpoint message to be displayed.
   */
  announceCheckpoint(checkpoint: string): void {
    this.addNewline();

    this.writeToStdOut(
      '=================================================================================================',
    );
    this.addNewline();
    this.writeToStdOut(`# ${this.checkpointCounter} ${checkpoint}`);
    this.addNewline();
    this.writeToStdOut(
      '=================================================================================================',
    );

    this.checkpointCounter += 1;
    this.addNewline();
  }

  /**
   * Writes an error message to the standard output.
   * @param config - The configuration object for the error message.
   * @param config.title - The title of the error message.
   * @param config.bodyLines - The body lines of the error message. Optional.
   */
  error({title, bodyLines}: CLIErrorMessageConfig): void {
    this.addNewline();

    this.writeOutputTitle({
      color: 'red',
      title: chalk.red(title),
    });

    this.writeOptionalOutputBody(bodyLines);

    this.addNewline();
  }

  /**
   * Writes a warning message to the standard output.
   * @param config - The configuration object for the warning message.
   * @param config.title - The title of the warning message.
   * @param config.bodyLines - The body lines of the warning message. Optional.
   */
  warn({title, bodyLines}: CLIWarnMessageConfig): void {
    this.addNewline();

    this.writeOutputTitle({
      color: 'yellow',
      title: chalk.yellow(title),
    });

    this.writeOptionalOutputBody(bodyLines);

    this.addNewline();
  }

  /**
   * Writes a note message to the standard output.
   * @param config - The configuration object for the note message.
   * @param config.title - The title of the note message.
   * @param config.bodyLines - The body lines of the note message. Optional.
   */
  note({title, bodyLines}: CLINoteMessageConfig): void {
    this.addNewline();

    this.writeOutputTitle({
      color: 'blue',
      title: chalk.hex('#0074D9')(title),
    });

    this.writeOptionalOutputBody(bodyLines);

    this.addNewline();
  }

  /**
   * Writes a success message to the standard output.
   * @param config - The configuration object for the success message.
   * @param config.title - The title of the success message.
   * @param config.bodyLines - The body lines of the success message. Optional.
   */
  success({title, bodyLines}: CLISuccessMessageConfig): void {
    this.addNewline();

    this.writeOutputTitle({
      color: 'green',
      title: chalk.green(title),
    });

    this.writeOptionalOutputBody(bodyLines);

    this.addNewline();
  }

  /**
   * Writes a log message to the standard output.
   * @param config - The configuration object for the log message.
   * @param config.title - The title of the log message.
   * @param config.bodyLines - The body lines of the log message. Optional.
   * @param config.color - The color of the log message. Optional.
   */
  log({title, bodyLines, color}: CLILogMessageConfig & {color?: string}): void {
    if (title) {
      this.addNewline();

      this.writeOutputTitle({
        color: 'cyan',
        title: color ? (chalk as any)[color](title) : title,
      });

      this.addNewline();
    }

    this.writeOptionalOutputBody(bodyLines);

    this.addNewline();
  }

  // eslint-disable-next-line class-methods-use-this
  check({text, color}: {color?: string; text: string}): string {
    return `${chalk.green('✔')} ${color ? (chalk as any)[color](text) : text}`;
  }

  // eslint-disable-next-line class-methods-use-this
  skip({text, color}: {color?: string; text: string}): string {
    return `${chalk.yellow('🚸')} ${color ? (chalk as any)[color](text) : text}`;
  }
}

export default new CLIOutput();
