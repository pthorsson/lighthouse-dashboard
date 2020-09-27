import { useEffect, useCallback } from 'react';
import { wait } from '@lib/utils';
import { apiFetch } from '@lib/adal';
import { useObjectState } from './use-object-state';

type ApiResponse<T> = {
  data: T;
  error: any;
  state: API_STATE;
  exec: ApiExecute;
};

type ApiExecuteOptions = {
  payload?: any;
  params?: { [key: string]: string | number };
};

type ApiExecute = (options?: ApiExecuteOptions) => Promise<void>;

export enum API_STATE {
  IDLE = 'IDLE',
  FETCHING = 'FETCHING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  /**
   * Executes request on mount, does only work for `GET` requests.
   */
  runOnMount?: boolean;

  /**
   * Simulate delay on API call response.
   */
  delay?: number;
};

type InternalState = {
  data: any;
  error: any;
  requestState: API_STATE;
};

export const useApi = <T>(
  url: string,
  options: ApiOptions = {}
): ApiResponse<T> => {
  const runOnMount = !!options.runOnMount;
  const method: ApiOptions['method'] = options.method || 'GET';
  const delay = options.delay || 0;

  const [state, setState] = useObjectState<InternalState>({
    data: null,
    error: null,
    requestState: API_STATE.IDLE,
  });

  const exec: ApiExecute = useCallback(
    ({ payload, params = {} } = {}) =>
      new Promise<void>(resolve => {
        setState({
          requestState: API_STATE.FETCHING,
          error: null,
        });

        const templatedUrl = templateUrlParams(url, params);

        execRequest(templatedUrl, method, payload, delay, (data, error) => {
          setState({
            data,
            error,
            requestState: data ? API_STATE.SUCCESS : API_STATE.ERROR,
          });
          resolve();
        });
      }),
    [state]
  );

  // Execute request on mount if set and method is GET
  useEffect(() => {
    if (runOnMount && method === 'GET') {
      exec();
    }
  }, []);

  return {
    data: state.data,
    error: state.error,
    state: state.requestState,
    exec,
  };
};

/**
 * Wrapper function for triggering an async fetch request with a callback to be
 * used in a hook.
 */
const execRequest = async (
  url: string,
  method: ApiOptions['method'],
  payload: any,
  delay: number,
  callback: (data: any, error: any) => void
) => {
  delay && (await wait(delay));

  const res = await apiFetch(url, {
    method,
    headers: {
      Accept: 'application/json',
    },
    ...((method === 'POST' || method === 'PUT') &&
      payload && {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
  });

  const data = await res.json();

  if (res.status === 200) {
    callback(data, null);
  } else {
    callback(null, data);
  }
};

/**
 * Helper for templating URL params from object.
 */
const templateUrlParams = (
  url: string,
  params: ApiExecuteOptions['params'] = {}
) =>
  url.replace(/:([a-zA-Z0-9]+)/g, (fullMatch, key: string) =>
    params[key].toString()
  );
