import React from 'react';
import styled from 'styled-components';
import { useApi, useLighthouse } from '@hooks';
import { Button } from '@ui/buttons';
import Icon from '@ui/icon';

const Actions: React.FC = () => {
  const { section, state } = useLighthouse();
  const runAllAudits = useApi(`/api/actions/trigger-all-audits/${section}`);
  const clearQueue = useApi(`/api/actions/remove-all-queued-audits/${section}`);

  return (
    <>
      <Button size="large" onClick={() => runAllAudits.exec()}>
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

// Elements

const Wrapper = styled.div``;
