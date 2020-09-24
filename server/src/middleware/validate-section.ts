import { RequestHandler } from 'express';
import { LIGHTHOUSE_HANDLER_STATES, getSections } from '@lib/lighthouse';

type MiddlewareOptions = {
  returnJson?: boolean;
};

export const validateSection = (
  options: MiddlewareOptions = {}
): RequestHandler => async (req, res, next) => {
  const { section } = req.params;

  const sections = getSections();

  if (sections.find(({ slug }) => slug === section)) {
    return next();
  }

  if (options.returnJson) {
    res.status(404).json({
      status: LIGHTHOUSE_HANDLER_STATES.INVALID_SECTION,
      message: 'Invalid section',
    });
  } else {
    res.status(404).send('Section not found');
  }
};
