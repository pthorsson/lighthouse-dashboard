import { useEffect, useState, useCallback } from 'react';
import { useDidUpdateEffect } from './use-did-update-effect';
import { wait } from '@lib/utils';
import { apiFetch } from '@lib/adal';

type ApiResponse<T> = {
  data: T;
  error: any;
  state: API_STATE;
  exec: (options?: {
    payload?: InternalState['payload'];
    params?: InternalState['params'];
  }) => void;
};

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
  payload: any;
  params: { [key: string]: string | number };
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

  const [triggerCheck, triggerExec] = useState(0);

  const [state, setState] = useState<InternalState>({
    payload: null,
    params: {},
    data: null,
    error: null,
    requestState: API_STATE.IDLE,
  });

  const updateState = (data: any) => setState({ ...state, ...data });

  const exec = useCallback(() => triggerExec(triggerCheck + 1), [triggerCheck]);

  // Set mounted state
  useEffect(() => {
    if (runOnMount && method === 'GET') {
      exec();
    }
  }, []);

  // Execute request
  useDidUpdateEffect(() => {
    updateState({
      requestState: API_STATE.FETCHING,
      error: null,
    });

    const templatedUrl = templateUrlParams(url, state.params);

    execRequest(templatedUrl, method, state.payload, delay, (data, error) => {
      updateState({
        data,
        error,
        requestState: data ? API_STATE.SUCCESS : API_STATE.ERROR,
      });
    });
  }, [triggerCheck]);

  return {
    data: state.data,
    error: state.error,
    state: state.requestState,
    exec: (options = {}) => {
      updateState({
        payload: options.payload || null,
        params: options.params || {},
      });
      exec();
    },
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
const templateUrlParams = (url: string, params: InternalState['params'] = {}) =>
  url.replace(/:([a-zA-Z0-9]+)/g, (fullMatch, key: string) =>
    params[key].toString()
  );
