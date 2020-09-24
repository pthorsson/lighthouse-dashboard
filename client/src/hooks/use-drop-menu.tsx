import React, { useContext, useMemo } from 'react';

type DropMenuState = {
  current: string;
  wasToggeled: boolean;
};

type ContextState = {
  current: string;
  set: (id: string) => void;
};

const DropMenuContext = React.createContext<ContextState>({
  current: null,
  set: () => {},
});

export class DropMenuProvider extends React.Component {
  io: SocketIOClient.Socket;

  state: DropMenuState = {
    current: null,
    wasToggeled: null,
  };

  componentDidMount() {
    window.addEventListener('click', this.clickOutsideHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.clickOutsideHandler);
  }

  clickOutsideHandler = () => {
    if (!this.state.wasToggeled && this.state.current !== null) {
      this.setState({ current: null });
    }
  };

  set = (id: string) => {
    this.setState({ current: id, wasToggeled: true });

    // Fix for closing drop down on click outside
    setTimeout(() => this.setState({ wasToggeled: false }));
  };

  render() {
    const context: ContextState = {
      current: this.state.current,
      set: this.set,
    };

    return (
      <DropMenuContext.Provider value={context}>
        {this.props.children}
      </DropMenuContext.Provider>
    );
  }
}

type DropMenuHook = (
  id: string
) => { isOpen: boolean; toggle: (open?: boolean) => void };

export const useDropMenu: DropMenuHook = (id: string) => {
  const { current, set } = useContext(DropMenuContext);
  const isOpen = id === current;

  return {
    isOpen,
    toggle: (open = null) => {
      open = open === null ? !isOpen : open;
      set(open ? id : null);
    },
  };
};
