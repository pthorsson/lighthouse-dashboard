import { join } from 'path';
import * as filesize from 'filesize';
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
    emitLog(lines, verbose);
    logFileStream && logFileStream.write(`${lines.join('\n')}\n`);
  };

  const logPrefix = () => `${new Date().toUTCString()} Info:`;

  // Set timer
  const getTimePassed = createTimer();

  log([
    `${logPrefix()} Starting audit on ${url}`,
    `${logPrefix()} CPU throttle set to ${cpuThrottle.toFixed(1)}`,
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
  log([`${logPrefix()} Lighthouse run completed!`]);

  try {
    log([`${logPrefix()} Loading generated HTML and JSON report files ...`]);

    // Read temporary report files
    const jsonReportContent = readFileSync(
      `${tempFileName}.report.json`,
      'utf8'
    );
    const htmlReportContent = readFileSync(
      `${tempFileName}.report.html`,
      'utf8'
    );

    log([`${logPrefix()} Cleaning up temporary files ...`]);

    // Delete temporary report files
    readdirSync(TMP_DIR).forEach((fileName) => {
      if (/\.report\.(json|html)$/.test(fileName)) {
        unlinkSync(join(TMP_DIR, fileName));
      }
    });

    log([`${logPrefix()} Parsing generated JSON report file content ...`]);

    const data = JSON.parse(jsonReportContent);

    const score = {
      performance: data.categories.performance.score,
      accessibility: data.categories.accessibility.score,
      bestPractices: data.categories['best-practices'].score,
      seo: data.categories.seo.score,
    };

    // Compress JSON and HTML reports
    const jsonCompressed = await compress(jsonReportContent);
    const htmlCompressed = await compress(htmlReportContent);

    // Get data sizes
    const jsonInputSize = Buffer.byteLength(jsonReportContent);
    const jsonOutputSize = Buffer.byteLength(jsonCompressed);
    const htmlInputSize = Buffer.byteLength(htmlReportContent);
    const htmlOutputSize = Buffer.byteLength(htmlCompressed);

    log([
      '----',
      `${logPrefix()} Score ${JSON.stringify(score, null, 2)}`,
      `${logPrefix()} JSON report size ${filesize(jsonInputSize)} (${filesize(
        jsonOutputSize
      )} compressed)`,
      `${logPrefix()} HTML report size ${filesize(htmlInputSize)} (${filesize(
        htmlOutputSize
      )} compressed)`,
    ]);

    log([
      '----',
      `${logPrefix()} Audit finished after ${getTimePassed() / 1000}s`,
    ]);

    logFileStream?.end();

    return {
      score,
      jsonReportContent: jsonCompressed,
      htmlReportContent: htmlCompressed,
    };
  } catch (error) {
    log([
      '----',
      `${logPrefix()} Audit failed after ${getTimePassed() / 1000}s`,
      'Error:',
      error.toString(),
    ]);

    logFileStream?.end();
  }

  return null;
};
