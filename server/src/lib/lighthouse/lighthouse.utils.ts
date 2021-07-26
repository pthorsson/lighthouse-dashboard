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
  url: string
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
