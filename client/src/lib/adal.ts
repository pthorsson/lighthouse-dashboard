import { AuthenticationContext, adalFetch } from 'react-adal';
import { getUrlQuery } from './utils.js';

const { token } = getUrlQuery();

const adalConfig = {
  clientId: process.env.AUTH_AD_CLIENT_ID as string,
  tenant: process.env.AUTH_AD_TENANT_ID as string,
  endpoints: {
    api: process.env.AUTH_AD_CLIENT_ID,
  },
  redirectUri: window.location.origin,
};

export const authContext = new AuthenticationContext(adalConfig);

/**
 * Fetch wrapper with Adal for including bearer token for Azure AD.
 */
const adalApiFetch = (url: string, options = {}): Promise<Response> =>
  adalFetch(authContext, adalConfig.endpoints.api, fetch, url, options);

/**
 * Fetch wrapper with regular fetch but with appended token param.
 */
const tokenApiFetch = (url: string, options = {}): Promise<Response> => {
  const _url = new URL(url.startsWith('http') ? url : location.origin + url);
  const _params = new URLSearchParams();

  _params.append('token', token);

  return fetch(`${_url.origin}${_url.pathname}?${_params.toString()}`, options);
};

export const apiFetch = token ? tokenApiFetch : adalApiFetch;
