import { join } from 'path';
import {
  readFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  readdirSync,
  writeFileSync,
  createWriteStream,
  WriteStream,
} from 'fs';
import { TMP_DIR, ROOT_DIR, VERBOSE_LIGHTHOUSE_LOGGING } from '@config';
import { createTimer, parseToLines, compress, spawnAsync } from '@lib/utils';

/**
 * CPU Throttle value calculation
 *
 * This function will take the benchmarkIndex that can be found in a Lighthouse
 * report and calculate an appropriate CPU throttling value.
 *
 * Based on the instructions on CPU throttling from from Google.
 * https://github.com/GoogleChrome/lighthouse/blob/master/docs/throttling.md#cpu-throttling
 *
 * And the actual numbers and forumals from lighthouse-cpu-throttling-calculator
 * by patrickhulce (https://github.com/patrickhulce).
 * https://github.com/patrickhulce/lighthouse-cpu-throttling-calculator/blob/a9c67dc1c58c972a0673bef05756290105334af1/pages/index.js
 */
export const calculateCpuThrottling = (benchmarkIndex: number) => {
  if (benchmarkIndex >= 1300) {
    // 2000 = 6x slowdown
    // 1766 = 5x slowdown
    // 1533 = 4x slowdown
    // 1300 = 3x slowdown
    const excess = (benchmarkIndex - 1300) / 233;
    const multiplier = 3 + excess;

    return multiplier;
  } else if (benchmarkIndex >= 800) {
    // 1300 = 3x slowdown
    // 800 = 2x slowdown
    const excess = (benchmarkIndex - 800) / 500;
    const multiplier = 2 + excess;

    return multiplier;
  } else {
    // 800 = 2x slowdown
    // 150 = 1x
    const excess = (benchmarkIndex - 150) / 650;
    const multiplier = 1 + excess;

    return multiplier;
  }
};

/**
 * Async Lighthouse wrapper.
 */

type LighthouseScore = {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
};

type LighthouseOutput = {
  score: LighthouseScore;
  htmlReportContent: string;
  jsonReportContent: string;
};

type LighthouseCommandConfig = {
  url: string;
  cpuThrottle?: number;
  onLogEvent?: (line: string[], logToConsole?: boolean) => void;
  logFile?: string;
};

export const asyncLighthouseCommand = async ({
  url,
  cpuThrottle = 1,
  onLogEvent: emitLog = () => {},
  logFile,
}: LighthouseCommandConfig): Promise<LighthouseOutput | null> => {
  // Ensure tmp dir
  if (!existsSync(TMP_DIR)) {
    mkdirSync(TMP_DIR);
  }

  let logFileStream: WriteStream;

  if (logFile) {
    // Ensure empty logfile on start
    writeFileSync(logFile, '');

    logFileStream = createWriteStream(logFile, { flags: 'a' });
  }

  // Wrapper function for logging and emitting output
  const log = (lines: string[], verbose = true) => {
    const lineWithTimestamp = lines.map(
      (line) => `${new Date().toUTCString()} ${line}`
    );
    emitLog(lines, verbose);
    logFileStream && logFileStream.write(`${lines.join('\n')}\n`);
  };

  const withTimestamp = (message: string) =>
    `${new Date().toUTCString()} ${message}`;

  // Set timer
  const getTimePassed = createTimer();

  log([
    withTimestamp(`Starting audit on ${url}`),
    withTimestamp(`CPU throttle set to ${cpuThrottle.toFixed(1)}`),
  ]);
  log(['----'], VERBOSE_LIGHTHOUSE_LOGGING);

  // Temporary report file name
  const tempFileName = join(TMP_DIR, `temp-report_${new Date().getTime()}`);

  // Lighthouse bin file
  const lighthouseBin = join(ROOT_DIR, 'node_modules/.bin/lighthouse');

  // Callback functions for stdout and stderr
  const catchSpawnOutputs = (data: Buffer) => {
    const lines = parseToLines(data);
    log(lines, VERBOSE_LIGHTHOUSE_LOGGING);
  };

  // Execute Lighthouse command asynchronously
  await spawnAsync(lighthouseBin, {
    args: [
      url,
      '--output=json,html',
      `--output-path=${tempFileName}`,
      '--only-categories=accessibility,best-practices,performance,seo',
      '--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu"',
      '--verbose',
      `--throttling.cpuSlowdownMultiplier=${cpuThrottle.toFixed(1)}`,
    ],
    onStdOutData: catchSpawnOutputs,
    onStdErrData: catchSpawnOutputs,
  });

  log(['----'], VERBOSE_LIGHTHOUSE_LOGGING);
  log([withTimestamp('Lighthouse run completed!')]);

  try {
    log([withTimestamp('Loading generated HTML and JSON report files ...')]);

    // Read temporary report files
    const jsonReportContent = readFileSync(
      `${tempFileName}.report.json`,
      'utf8'
    );
    const htmlReportContent = readFileSync(
      `${tempFileName}.report.html`,
      'utf8'
    );

    log([withTimestamp('Cleaning up temporary files ...')]);

    // Delete temporary report files
    readdirSync(TMP_DIR).forEach((fileName) => {
      if (/\.report\.(json|html)$/.test(fileName)) {
        unlinkSync(join(TMP_DIR, fileName));
      }
    });

    log([withTimestamp('Parsing generated JSON report file content ...')]);

    const data = JSON.parse(jsonReportContent);

    const score = {
      performance: data.categories.performance.score,
      accessibility: data.categories.accessibility.score,
      bestPractices: data.categories['best-practices'].score,
      seo: data.categories.seo.score,
    };

    log(['----', withTimestamp(`Score ${JSON.stringify(score, null, 2)}`)]);

    log([
      '----',
      withTimestamp(`Audit finished after ${getTimePassed() / 1000}s`),
    ]);

    logFileStream?.end();

    return {
      score,
      jsonReportContent,
      htmlReportContent,
    };
  } catch (error) {
    log([
      '----',
      withTimestamp(`Audit failed after ${getTimePassed() / 1000}s`),
      'Error:',
      error.toString(),
    ]);

    logFileStream?.end();
  }

  return null;
};
