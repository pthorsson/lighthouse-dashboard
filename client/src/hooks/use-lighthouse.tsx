import React, { useContext } from 'react';
import * as socketIo from 'socket.io-client';
import { deepCopy } from '@lib/utils';

type LighthouseState = {
  active: string;
  queue: string[];
};

type ContextState = {
  section: string;
  data: Lhd.Section;
  state: LighthouseState;
  previousState: LighthouseState;
};

type SocketResponse<T> = {
  section: string;
} & T;

const LighthouseContext = React.createContext<ContextState>({
  section: null,
  data: null,
  state: {
    active: null,
    queue: [],
  },
  previousState: {
    active: null,
    queue: [],
  },
});

type Props = {
  section: string;
};

export class LighthouseProvider extends React.Component<Props> {
  io: SocketIOClient.Socket;

  section: string;

  data: Lhd.Section = null;

  previousState: LighthouseState = {
    active: null,
    queue: [],
  };

  state: LighthouseState = {
    active: null,
    queue: [],
  };

  constructor(props: Props) {
    super(props);

    this.section = this.props.section;
  }

  componentDidMount() {
    this.io = socketIo(location.origin, {
      path: '/socket',
      query: { section: this.section },
    });

    // Request initial section data
    this.io.emit('request-section-data', this.section);
    this.io.emit('request-state-update', this.section);

    type SectionDataRes = {
      section: Lhd.Section;
    };

    // Reciever for section data requests
    this.io.on('section-data', (res: SocketResponse<SectionDataRes>) => {
      this.data = res.section;

      this.forceUpdate();
    });

    type StateUpdateRes = {
      state: LighthouseState;
      previousState: LighthouseState;
    };

    // Listener for state updates
    this.io.on(
      'section-state-update',
      (res: SocketResponse<StateUpdateRes>) => {
        this.previousState = { ...this.state };
        this.setState({ ...res.state });
      }
    );

    type AuditCompleteRes = {
      audit: Lhd.Audit;
      deletedAudits: string[];
    };

    // Listener for audit completions
    this.io.on('audit-complete', (res: SocketResponse<AuditCompleteRes>) => {
      this.data.pageGroups.forEach((pageGroup) => {
        pageGroup.pages.forEach((page) => {
          if (page._id === res.audit.page) {
            page.audits.unshift({ ...res.audit });
            page.audits = page.audits.filter(
              (audit) => res.deletedAudits.indexOf(audit._id) === -1
            );
          }
        });
      });

      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.io.close();
  }

  render() {
    const context: ContextState = {
      section: this.section,
      data: deepCopy(this.data),
      state: { ...this.state },
      previousState: { ...this.previousState },
    };

    return (
      <LighthouseContext.Provider value={context}>
        {this.props.children}
      </LighthouseContext.Provider>
    );
  }
}

type LighthouseHook = () => ContextState;

export const useLighthouse: LighthouseHook = () =>
  useContext(LighthouseContext);
