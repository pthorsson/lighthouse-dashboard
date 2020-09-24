import { HookNextFunction } from 'mongoose';

/**
 * Increments document version number.
 */
export const incrementVersion = function(next: HookNextFunction) {
  if (this.isModified()) this.increment();

  next();
};
