import { DASHBOARD_VERSION, BUILD_TIMESTAMP } from '../config.js';

/**
 * Appends a script tag with json data to the html.
 */
export const appendLhdData = (html: string) =>
  html.replace(
    '%%LHD_DATA%%',
    `<script id="__LHD_DATA__" type="application/json">${JSON.stringify({
      DASHBOARD_VERSION,
      BUILD_TIMESTAMP,
      AUTH_AD_CLIENT_ID: process.env.AUTH_AD_CLIENT_ID,
      AUTH_AD_TENANT_ID: process.env.AUTH_AD_TENANT_ID,
    })}</script>`
  );
