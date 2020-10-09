import React, { useContext } from 'react';

type AppState = {
  comparedMode: boolean;
};

type ContextState = AppState & {
  setState: (state: Partial<AppState>) => void;
};

const AppStateContext = React.createContext<ContextState>({
  comparedMode: false,
  setState: null,
});

export class AppStateProvider extends React.Component {
  state: AppState = {
    comparedMode: false,
  };

  _setState = (data: Partial<AppState>) => {
    this.setState({ ...data });
  };

  render() {
    const context: ContextState = {
      comparedMode: this.state.comparedMode,
      setState: this._setState,
    };

    return (
      <AppStateContext.Provider value={context}>
        {this.props.children}
      </AppStateContext.Provider>
    );
  }
}

type AppStateHook = () => ContextState;

export const useAppState: AppStateHook = () => useContext(AppStateContext);
