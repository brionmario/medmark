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

/**
 * Represents the configuration options for the application.
 */
export interface Configuration {
  /**
   * Determines whether the application is running in debug mode or not.
   */
  debug: boolean;
  /**
   * The timestamp when the application was last run.
   */
  runnerTimestamp: string;
}

/**
 * A service for managing configuration settings.
 */
class ConfigurationService {
  /**
   * The singleton instance of the ConfigurationService.
   */
  private static instance: ConfigurationService;

  /**
   * The current configuration object.
   */
  private config: Configuration = {
    debug: true,
    runnerTimestamp: new Date().toISOString(),
  };

  /**
   * The private constructor, only called once by `getInstance()`.
   */
  private constructor() {}

  /**
   * Returns the singleton instance of the ConfigurationService.
   * If an instance does not yet exist, creates one and returns it.
   * @returns The ConfigurationService singleton instance.
   */
  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }

    return ConfigurationService.instance;
  }

  /**
   * Returns the current debug setting.
   * @returns Whether or not debug mode is enabled.
   */
  public getDebug(): boolean {
    return this.config.debug;
  }

  /**
   * Sets the debug setting to the specified value.
   * @param debug Whether or not debug mode should be enabled.
   */
  public setDebug(debug: boolean): void {
    this.config.debug = debug;
  }

  /**
   * Returns the current runnerTimestamp setting.
   * @returns The timestamp of the last time the runner was executed.
   */
  public getRunnerTimestamp(): string {
    return this.config.runnerTimestamp;
  }

  /**
   * Sets the runnerTimestamp to the specified value.
   * @param timestamp The new timestamp value.
   */
  public setRunnerTimestamp(timestamp: string): void {
    this.config.runnerTimestamp = timestamp;
  }
}

export default ConfigurationService;
