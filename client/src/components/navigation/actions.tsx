import React from 'react';
import {
  useApi,
  useLighthouse,
  useAppState,
  SERVER_STATE,
} from '../../hooks/index.js';
import { Button } from '../../ui/buttons.js';
import Icon from '../../ui/icon.js';

const Actions: React.FC = () => {
  const { section, state } = useLighthouse();
  const { serverState } = useAppState();
  const runAllAudits = useApi(`/api/actions/trigger-all-audits/${section}`);
  const clearQueue = useApi(`/api/actions/remove-all-queued-audits/${section}`);

  return (
    <>
      <Button
        size="large"
        onClick={() => runAllAudits.exec()}
        disabled={serverState !== SERVER_STATE.OK}
      >
        Run all audits
        <Icon type="play" style={{ marginLeft: '10px' }} />
      </Button>
      <Button
        size="large"
        onClick={() => clearQueue.exec()}
        disabled={!state.queue.length}
      >
        Clear queue
        <Icon type="cross" style={{ marginLeft: '10px' }} />
      </Button>
    </>
  );
};

export default Actions;
