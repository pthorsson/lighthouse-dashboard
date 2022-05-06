import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RequestHandler } from 'express';
import { APP_DIST_DIR } from '../config.js';
import { decompress } from '../lib/utils.js';
import * as lighthouse from '../lib/lighthouse/index.js';
import * as reportCache from '../lib/report-cache.js';
import Report from '../models/report.model.js';
import { validateSection } from '../middleware/index.js';
import { appendLhdData } from '../lib/append-lhd-data.js';

let indexHtmlCache: string = null;

/**
 * Get all section slugs
 */
export const getSections: RequestHandler[] = [
  (req, res) => {
    res.json(lighthouse.getSections());
  },
];

/**
 * Serves client side app
 */
export const getSectionData: RequestHandler[] = [
  validateSection({ returnJson: true }),
  (req, res) => {
    const { section } = req.params;

    const sectionData = lighthouse.getSectionData(section);

    res.json(sectionData);
  },
];

/**
 * Serves a generated report
 */
export const serveReport: RequestHandler[] = [
  async (req, res) => {
    const { json } = req.query;
    const { audit } = req.params;

    const reportType = typeof json !== 'undefined' ? 'json' : 'html';
    const cachedReport = reportCache.get(audit, reportType);

    if (cachedReport) {
      return reportType === 'json'
        ? res.json(cachedReport)
        : res.send(cachedReport);
    }

    try {
      const report = await Report.findOne({ audit: audit }, [
        '_id',
        reportType === 'json' ? 'encodedJson' : 'encodedHtml',
      ]);

      if (report) {
        if (typeof json !== 'undefined') {
          const decompressedJsonStr = await decompress(report.encodedJson);
          const json = JSON.parse(decompressedJsonStr);

          reportCache.save(audit, 'json', json);

          res.json(json);
        } else {
          const html = await decompress(report.encodedHtml);

          reportCache.save(audit, 'html', html);

          res.send(html);
        }
      } else {
        res.status(404).send('Report not found');
      }
    } catch (error) {
      console.log('Error returning report');
      console.error(error);
      res.status(404).send('Report not found');
    }
  },
];

/**
 * Serves client side app
 */
export const serveApp: RequestHandler[] = [
  (req, res) => {
    res.setHeader('Content-Type', 'text/html');

    if (indexHtmlCache) {
      res.send(indexHtmlCache);
    } else {
      readFile(join(APP_DIST_DIR, 'index.html'), 'utf8').then((html) => {
        indexHtmlCache = appendLhdData(html);

        res.send(indexHtmlCache);
      });
    }
  },
];

/**
 * Gets the current user
 */
export const getCurrentUser: RequestHandler[] = [
  (req, res) => {
    res.status(200).json(req.currentUser);
  },
];
