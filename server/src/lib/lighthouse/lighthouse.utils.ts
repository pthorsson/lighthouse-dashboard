import { spawn } from 'child_process';
import { join } from 'path';
import {
  readFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  readdirSync,
} from 'fs';
import { TMP_DIR } from '@config';

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

export const asyncLighthouseCommand = (
  url: string
): Promise<LighthouseOutput | null> =>
  new Promise(resolve => {
    // Ensure tmp dir
    if (!existsSync(TMP_DIR)) {
      mkdirSync(TMP_DIR);
    }

    // Temporary report file name
    const tempFileName = join(TMP_DIR, `temp-report_${new Date().getTime()}`);

    // Run Lighthouse command process
    const lh = spawn('./node_modules/.bin/lighthouse', [
      url,
      '--output=json,html',
      `--output-path=${tempFileName}`,
      '--only-categories=accessibility,best-practices,performance,seo',
      '--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu"',
    ]);

    lh.on('close', () => {
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
        readdirSync(TMP_DIR).forEach(fileName => {
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
