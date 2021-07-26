const path = require('path');
const fs = require('fs');

const clientIndexHtmlFile = path.join(__dirname, '../.build/client/index.html');
const serverConfigFile = path.join(__dirname, '../.build/server/config.js');

const serverConfigFileContent = fs.readFileSync(serverConfigFile, 'utf8');

const BUILD_TIMESTAMP = new Date().toISOString();
const COMMIT_HASH = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString()
  .trim();

// Append build info to client index file
fs.appendFileSync(
  clientIndexHtmlFile,
  `
<!--
  Commit hash:      ${COMMIT_HASH}
  Build timestamp:  ${BUILD_TIMESTAMP}
-->`
);

// Add build info to server config file
fs.writeFileSync(
  serverConfigFile,
  serverConfigFileContent
    .replace('%%commit_hash%%', COMMIT_HASH)
    .replace('%%build_timestamp%%', BUILD_TIMESTAMP),
  'utf8'
);
