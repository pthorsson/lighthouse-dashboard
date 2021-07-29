import { spawn } from 'child_process';
import { join } from 'path';
import {
  readFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  readdirSync,
} from 'fs';
import { createLogger } from '@lib/utils';
import { TMP_DIR, ROOT_DIR } from '@config';

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

const log = createLogger('lighthouse-process');

export const asyncLighthouseCommand = (
  url: string,
  cpuThrottle = 1
): Promise<LighthouseOutput | null> =>
  new Promise((resolve) => {
    // Ensure tmp dir
    if (!existsSync(TMP_DIR)) {
      mkdirSync(TMP_DIR);
    }

    // Temporary report file name
    const tempFileName = join(TMP_DIR, `temp-report_${new Date().getTime()}`);

    // Lighthouse bin file
    const lighthouseBin = join(ROOT_DIR, 'node_modules/.bin/lighthouse');

    // Run Lighthouse command process
    const lh = spawn(lighthouseBin, [
      url,
      '--output=json,html',
      `--output-path=${tempFileName}`,
      '--only-categories=accessibility,best-practices,performance,seo',
      '--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu"',
      '--verbose',
      `--throttling.cpuSlowdownMultiplier=${cpuThrottle.toFixed(1)}`,
    ]);

    log('STARTING');

    lh.stdout.on('data', (data) => {
      log(`stdout: ${data}`);
    });

    lh.stderr.on('data', (data) => {
      log(`stderr: ${data}`);
    });

    lh.on('close', () => {
      log('FINISHED');

      try {
        // Read temporary report files
        const jsonReportContent = readFileSync(
          `${tempFileName}.report.json`,
          'utf8'
        );
        const htmlReportContent = readFileSync(
          `${tempFileName}.report.html`,
          'utf8'
        );

        // Delete temporary report files
        readdirSync(TMP_DIR).forEach((fileName) => {
          if (/\.report\.(json|html)$/.test(fileName)) {
            unlinkSync(join(TMP_DIR, fileName));
          }
        });

        const data = JSON.parse(jsonReportContent);

        const score = {
          performance: data.categories.performance.score,
          accessibility: data.categories.accessibility.score,
          bestPractices: data.categories['best-practices'].score,
          seo: data.categories.seo.score,
        };

        return resolve({ score, jsonReportContent, htmlReportContent });
      } catch (error) {
        console.log(error);
      }

      resolve(null);
    });
  });
