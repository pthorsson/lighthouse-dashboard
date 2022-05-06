import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RequestHandler } from 'express';
import { DASHBOARD_VERSION, BUILD_TIMESTAMP, TMP_DIR } from '../../config.js';
import * as lighthouse from '../../lib/lighthouse/index.js';

/**
 * Get application info
 */
export const getApplicationInfo: RequestHandler[] = [
  (req, res) => {
    res.json({
      dashboardVersion: DASHBOARD_VERSION,
      buildTimestamp: BUILD_TIMESTAMP,
    });
  },
];

/**
 * Get application info
 */
export const getCalibrationLog: RequestHandler[] = [
  (req, res) => {
    try {
      const latestLogContent = readFileSync(
        join(TMP_DIR, 'latest-calibration-run.log'),
        'utf8'
      );

      res.json(latestLogContent.trim().split(/\r?\n/));
    } catch (error) {
      res.status(404).json('Log not found');
    }
  },
];

/**
 * Get application info
 */
export const getSectionLog: RequestHandler[] = [
  (req, res) => {
    const { section } = req.params;

    if (
      lighthouse.getSectionData(section) ===
      lighthouse.LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION
    ) {
      return res.status(404).json('Section not found');
    }

    try {
      const latestLogContent = readFileSync(
        join(TMP_DIR, `latest-run_${section}.log`),
        'utf8'
      );

      res.json(latestLogContent.trim().split(/\r?\n/));
    } catch (error) {
      res.status(404).json('Log not found');
    }
  },
];
