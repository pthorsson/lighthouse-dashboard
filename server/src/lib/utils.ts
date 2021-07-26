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
export const incrementId = (
  (i = 0) =>
  () =>
    i++
)();

/**
 * Wrapper function for encoding a base64 string.
 */
export const encodeBase64 = (str: string) =>
  Buffer.from(str).toString('base64');

/**
 * Wrapper function for decoding a base64 string.
 */
export const decodeBase64 = (base64Str: string) =>
  Buffer.from(base64Str, 'base64').toString();

/**
 * Generate a random base64 string.
 */
export const generateString = (minLength = 100, maxLength?: number) => {
  maxLength = Math.max(maxLength || minLength, minLength);

  let str = '';
  const CHARACTERS =
    'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789-_';

  const length = Math.floor(
    Math.random() * (maxLength - minLength + 1) + minLength
  );

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    const char = CHARACTERS[randomIndex];

    str += char;
  }

  return str;
};

/**
 * A function for simulating a delay.
 */
export const delay = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, duration);
  });
