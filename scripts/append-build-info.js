const path = require('path');
const fs = require('fs');
const packageJson = require('../package.json');

const clientIndexHtmlFile = path.join(__dirname, '../.build/client/index.html');
const serverConfigFile = path.join(__dirname, '../.build/server/config.js');

const serverConfigFileContent = fs.readFileSync(serverConfigFile, 'utf8');

const BUILD_TIMESTAMP = new Date().toISOString();
const DASHBOARD_VERSION = packageJson.version;

// Append build info to client index file
fs.appendFileSync(
  clientIndexHtmlFile,
  `
<!--
  Dashboard version:  ${DASHBOARD_VERSION}
  Build timestamp:    ${BUILD_TIMESTAMP}
-->`
);

// Add build info to server config file
fs.writeFileSync(
  serverConfigFile,
  serverConfigFileContent
    .replace('%%dashboard_version%%', DASHBOARD_VERSION)
    .replace('%%build_timestamp%%', BUILD_TIMESTAMP),
  'utf8'
);
