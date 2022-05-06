import React, { useState, useCallback, useContext, useEffect } from 'react';
import socketIo from 'socket.io-client';

// This should be shared between client and server
export enum SERVER_STATE {
  OK = 'OK',
  ERROR = 'ERROR',
  CALIBRATING = 'CALIBRATING',
  INITIALIZING = 'INITIALIZING',
}

type AppState = {
  comparedMode: boolean;
  serverState: SERVER_STATE;
};

type Context = AppState & {
  setState: (state: Partial<AppState>) => void;
};

const AppStateContext = React.createContext<Context>({
  comparedMode: false,
  serverState: SERVER_STATE.INITIALIZING,
  setState: () => {},
});

export const AppStateProvider: React.FC = ({ children }) => {
  const [state, _setState] = useState<AppState>({
    comparedMode: false,
    serverState: SERVER_STATE.INITIALIZING,
  });

  const setState = useCallback(
    (newState: Partial<AppState>) => {
      _setState({ ...state, ...newState });
    },
    [state]
  );

  useEffect(() => {
    const io = socketIo(location.origin, {
      path: '/socket',
    });

    io.emit('request-server-state-update');

    io.on('server-state-update', (serverState: SERVER_STATE) => {
      setState({ serverState });
    });

    return () => {
      io.disconnect();
    };
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        setState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

type AppStateHook = () => Context;

export const useAppState: AppStateHook = () => useContext(AppStateContext);
