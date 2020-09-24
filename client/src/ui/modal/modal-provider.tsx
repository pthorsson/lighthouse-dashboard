import React, { useContext } from 'react';

type ModalState = {
  current: string;
  history: string[];
};

type ContextState = {
  current: string;
  history: string[];
  set: (id: string) => void;
  back: () => void;
};

const ModalContext = React.createContext<ContextState>({
  current: null,
  history: [],
  set: () => {},
  back: () => {},
});

export class ModalProvider extends React.Component {
  io: SocketIOClient.Socket;

  state: ModalState = {
    current: null,
    history: [],
  };

  set = (id: string) => {
    this.setState({
      current: id,
      history: [...this.state.history, id],
    });
  };

  back = () => {
    this.setState({
      current: this.state.history[this.state.history.length - 2],
      history: [...this.state.history.slice(0, -1)],
    });
  };

  render() {
    const context: ContextState = {
      current: this.state.current,
      history: [],
      set: this.set,
      back: this.back,
    };

    return (
      <ModalContext.Provider value={context}>
        {this.props.children}
      </ModalContext.Provider>
    );
  }
}

type ModalHook = (
  id: string
) => { isOpen: boolean; back: () => void; toggle: (open?: boolean) => void };

export const useModal: ModalHook = (id: string) => {
  const { current, back, set } = useContext(ModalContext);
  const isOpen = id === current;

  return {
    isOpen,
    back: () => back(),
    toggle: (open = null) => {
      open = open === null ? !isOpen : open;
      set(open ? id : null);
    },
  };
};
