import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppState, SERVER_STATE } from '../../hooks/index.js';
import Spinner from '../../ui/spinner.js';

const ServerStateBanner: React.FC = () => {
  const { serverState } = useAppState();
  const [show, setShow] = useState(false);

  const message = {
    [SERVER_STATE.INITIALIZING]: 'Initializing',
    [SERVER_STATE.CALIBRATING]: 'Calibrating Lighthouse',
    [SERVER_STATE.ERROR]: 'Error occured on server - cannot run audits',
    [SERVER_STATE.OK]: 'Ready',
  };

  useEffect(() => {
    if (serverState === SERVER_STATE.OK) {
      setTimeout(() => {
        setShow(false);
      }, 2300);
    } else {
      setShow(true);
    }
  }, [serverState]);

  return (
    show && (
      <Banner state={serverState}>
        <Text>{message[serverState]}</Text>
        {(serverState === SERVER_STATE.INITIALIZING ||
          serverState === SERVER_STATE.CALIBRATING) && <Spinner size={22} />}
      </Banner>
    )
  );
};

export default ServerStateBanner;

// Elements

type BannerProps = {
  state: SERVER_STATE;
};

const Banner = styled.div<BannerProps>`
  position: fixed;
  z-index: 999999;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 15px;
  color: white;
  transition: background 200ms;
  background: ${({ state, theme }) => {
    switch (state) {
      case SERVER_STATE.OK:
        return theme.colorSuccessDesaturated;
      case SERVER_STATE.ERROR:
        return theme.colorErrorDesaturated;
    }

    return theme.bg;
  }};
`;

const Text = styled.span`
  font-size: 14px;
  margin-right: 4px;
  font-weight: 500;
`;
