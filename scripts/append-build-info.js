import { join, dirname } from 'node:path';
import { writeFileSync, readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

const clientIndexHtmlFile = join(__dirname, '../.build/client/index.html');
const serverConfigFile = join(__dirname, '../.build/server/config.js');

const serverConfigFileContent = readFileSync(serverConfigFile, 'utf8');

const BUILD_TIMESTAMP = new Date().toISOString();
const DASHBOARD_VERSION = packageJson.version;

// Append build info to client index file
appendFileSync(
  clientIndexHtmlFile,
  `
<!--
  Dashboard version:  ${DASHBOARD_VERSION}
  Build timestamp:    ${BUILD_TIMESTAMP}
-->`
);

// Add build info to server config file
writeFileSync(
  serverConfigFile,
  serverConfigFileContent
    .replace('%%dashboard_version%%', DASHBOARD_VERSION)
    .replace('%%build_timestamp%%', BUILD_TIMESTAMP),
  'utf8'
);
