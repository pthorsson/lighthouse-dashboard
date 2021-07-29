import { v1 as uuid } from 'uuid';

export enum SERVER_STATE {
  OK = 'OK',
  ERROR = 'ERROR',
  CALIBRATING = 'CALIBRATING',
  INITIALIZING = 'INITIALIZING',
}

export type ServerState = {
  state: SERVER_STATE;
  cpuThrottle: number;
};

const initialState: ServerState = {
  state: SERVER_STATE.INITIALIZING,
  cpuThrottle: 1,
};

const _state = {
  current: { ...initialState },
  previous: { ...initialState },
};

type SubscriptionCallback = (state: ServerState, previous: ServerState) => void;

type Subscription = {
  id: string;
  callback: SubscriptionCallback;
  remove: () => void;
};

const subscriptions: Subscription[] = [];

export const get = (): ServerState => {
  return { ..._state.current };
};

export const set = (state: Partial<ServerState>): ServerState => {
  _state.previous = { ..._state.current };
  _state.current = { ..._state.current, ...state };

  emit();

  return { ..._state.current };
};

export const subscribe = (callback: SubscriptionCallback): Subscription => {
  const id = uuid();

  const remove = () => {
    for (let i = 0; i < subscriptions.length; i++) {
      if (subscriptions[i].id === id) {
        subscriptions.splice(i, 1);
      }
    }
  };

  const subscription = {
    id,
    callback,
    remove,
  };

  subscriptions.push(subscription);

  return subscription;
};

export const emit = () => {
  subscriptions.forEach((subscription) =>
    subscription.callback({ ..._state.current }, { ..._state.previous })
  );
};
