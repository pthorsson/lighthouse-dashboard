import { join } from 'path';

export const VERBOSE = true;

export const PORT = parseInt(process.env.PORT) || 3000;

export const ROOT_DIR = join(__dirname, '../../');
export const BUILD_DIR = join(ROOT_DIR, '.build');
export const TMP_DIR = join(ROOT_DIR, '.tmp');
export const APP_DIST_DIR = join(BUILD_DIR, 'client');
export const APP_STATIC_DIR = join(APP_DIST_DIR, 'static');

// Will be replaced with actual values in build step
export const COMMIT_HASH = '%%commit_hash%%';
export const BUILD_TIMESTAMP = '%%build_timestamp%%';
