import { RequestHandler } from 'express';
import * as lighthouse from '@lib/lighthouse';
import { validateSection } from '@middleware';

/**
 * Triggers an audit for selected section
 */
export const triggerAudit: RequestHandler[] = [
  validateSection({ returnJson: true }),
  (req, res) => {
    const { section, id } = req.params;

    const {
      ALREADY_ACTIVE,
      INVALID_ID,
      OK,
    } = lighthouse.LIGHTHOUSE_HANDLER_STATES;

    const messages: any = {
      [ALREADY_ACTIVE]: 'Already active or in queue',
      [INVALID_ID]: 'Invalid id',
      [OK]: 'Added url to audit queue',
    };

    const status = lighthouse.runAudit(section, id);

    res
      .status(status === lighthouse.LIGHTHOUSE_HANDLER_STATES.OK ? 200 : 400)
      .json({ status, message: messages[status] });
  },
];

/**
 * Triggers all audit for selected section
 */
export const triggerAllAudits: RequestHandler[] = [
  validateSection({ returnJson: true }),
  (req, res) => {
    const { section } = req.params;

    lighthouse.runAllAudits(section);

    res.json({ status: 'OK', message: 'Added all pages to audit queue' });
  },
];

/**
 * Triggers an audit for selected section
 */
export const removeQueuedAudit: RequestHandler[] = [
  validateSection({ returnJson: true }),
  (req, res) => {
    const { section, id } = req.params;

    const {
      ALREADY_ACTIVE,
      INVALID_ID,
      OK,
    } = lighthouse.LIGHTHOUSE_HANDLER_STATES;

    const messages: any = {
      [ALREADY_ACTIVE]: 'Already active or in queue',
      [INVALID_ID]: 'Invalid id',
      [OK]: 'Added url to audit queue',
    };

    const status = lighthouse.removeQueuedAudit(section, id);

    res
      .status(status === lighthouse.LIGHTHOUSE_HANDLER_STATES.OK ? 200 : 400)
      .json({ status, message: messages[status] });
  },
];

/**
 * Triggers all audit for selected section
 */
export const removeAllQueuedAudits: RequestHandler[] = [
  validateSection({ returnJson: true }),
  (req, res) => {
    const { section } = req.params;

    lighthouse.removeAllQueuedAudits(section);

    res.json({ status: 'OK', message: 'Cleared queue' });
  },
];
