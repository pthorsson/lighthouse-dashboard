import { RequestHandler } from 'express';
import { join } from 'path';
import { APP_DIST_DIR } from '@config';
import { decodeBase64 } from '@lib/utils';
import * as lighthouse from '@lib/lighthouse';
import * as reportCache from '@lib/report-cache';
import Report from '@models/report.model';
import { validateSection } from '@middleware';

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

    const sectionData = lighthouse.getData(section);

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
          const json = JSON.parse(decodeBase64(report.encodedJson));

          reportCache.save(audit, 'json', json);

          res.json(json);
        } else {
          const html = decodeBase64(report.encodedHtml);

          reportCache.save(audit, 'html', html);

          res.send(html);
        }
      } else {
        res.status(404).send('Report not found');
      }
    } catch (error) {
      res.status(404).send('Report not found');
    }
  },
];

/**
 * Serves client side app
 */
export const serveApp: RequestHandler[] = [
  (req, res) => {
    res.sendFile(join(APP_DIST_DIR, 'index.html'));
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
