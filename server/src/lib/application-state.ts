import { v1 as uuid } from 'uuid';

export enum APP_STATE {
  OK = 'OK',
  ERROR = 'ERROR',
  CALIBRATING = 'CALIBRATING',
  INITIALIZING = 'INITIALIZING',
}

type ApplicationState = {
  state: APP_STATE;
  cpuThrottle: number;
};

const initialState: ApplicationState = {
  state: APP_STATE.INITIALIZING,
  cpuThrottle: 1,
};

const _state = {
  current: { ...initialState },
  previous: { ...initialState },
};

type SubscriptionCallback = (
  state: ApplicationState,
  previous: ApplicationState
) => void;

type Subscription = {
  id: string;
  callback: SubscriptionCallback;
  remove: () => void;
};

const subscriptions: Subscription[] = [];

export const get = (): ApplicationState => {
  return { ..._state.current };
};

export const set = (state: Partial<ApplicationState>): ApplicationState => {
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
