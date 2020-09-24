import { VERBOSE } from '@config';

/**
 * Simple deep copy function.
 */
export const deepCopy = (data: any) => JSON.parse(JSON.stringify(data));

/**
 * Closure function for timing.
 */
export const createTimer = () => {
  const startTime = new Date().getTime();

  return () => {
    const endTime = new Date().getTime();
    const timePassed = endTime - startTime;

    return timePassed;
  };
};

/**
 * Wrapper for console.log that adds a given prefix.
 */
export const createLogger = (label: string) => (message: string) =>
  VERBOSE && console.log(`[${label}] ${message}`);

/**
 * A function that always returns an incremented number on each call.
 */
export const incrementId = ((i = 0) => () => i++)();

export const encodeBase64 = (str: string) =>
  Buffer.from(str).toString('base64');

export const decodeBase64 = (base64Str: string) =>
  Buffer.from(base64Str, 'base64').toString();
