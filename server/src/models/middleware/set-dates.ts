import { HookNextFunction } from 'mongoose';

/**
 * Sets createdAt and updatedAt timestamps.
 */
export const setDates = function(next: HookNextFunction) {
  let doc = this;
  let now = new Date();

  if (doc.isNew) {
    doc.createdAt = now;
  }

  doc.updatedAt = now;

  next();
};
