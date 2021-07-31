import { deflate, inflate } from 'zlib';
import { spawn } from 'child_process';
import * as stripAnsi from 'strip-ansi';

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
  console.log(`[${label}] ${message}`);

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

/**
 * Parse an unknown variable to a string and splitting it at line break. Mainly
 * used for parsing stdout buffers.
 */
export const parseToLines = (data: unknown): string[] =>
  data
    .toString()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(stripAnsi as any);

/**
 * Deflates a given string with the Zlib module.
 */
export const compress = (input: string) =>
  new Promise<string>((resolve, reject) => {
    deflate(input, { level: 9 }, (err, buffer) => {
      if (err) reject();

      resolve(buffer.toString('base64'));
    });
  });

/**
 * Inflates a given string with the Zlib module.
 */
export const decompress = (input: string) =>
  new Promise<string>((resolve, reject) => {
    inflate(Buffer.from(input, 'base64'), (err, buffer) => {
      if (err) reject();

      resolve(buffer.toString('utf8'));
    });
  });

/**
 * Async wrapper for the spawn function.
 */
type SpawnAsyncOptions = {
  args?: string[];
  onStdOutData?: (data: Buffer) => void;
  onStdErrData?: (data: Buffer) => void;
  onClose?: (code: number, signal: NodeJS.Signals) => void;
};

export const spawnAsync = (command: string, options: SpawnAsyncOptions = {}) =>
  new Promise((resolve) => {
    const cmd = spawn(command, options.args || []);

    if (options.onStdOutData) {
      cmd.stdout.on('data', options.onStdOutData);
    }

    if (options.onStdErrData) {
      cmd.stderr.on('data', options.onStdErrData);
    }

    cmd.on('close', (code, signal) => {
      resolve({ code, signal });

      if (options.onClose) {
        options.onClose(code, signal);
      }
    });
  });
