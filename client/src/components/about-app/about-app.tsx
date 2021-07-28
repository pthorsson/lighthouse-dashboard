import React from 'react';
import styled from 'styled-components';
import { useApi } from '@hooks';
import Modal, { ModalHeader, ModalSection } from '@ui/modal';

type AppInfoData = {
  dashboardVersion: string;
  buildTimestamp: string;
};

const AboutApp: React.FC = () => {
  const { data } = useApi<AppInfoData | null>('/api/application-info', {
    runOnMount: true,
  });

  return (
    <Modal id="application-info-modal">
      <ModalHeader>Application info</ModalHeader>
      <ModalSection sectionTitle="Dashboard version">
        <Value>{data?.dashboardVersion}</Value>
      </ModalSection>
      <ModalSection sectionTitle="Build timestamp">
        <Value>{data?.buildTimestamp}</Value>
      </ModalSection>
    </Modal>
  );
};

export default AboutApp;

// Elements

const Value = styled.div`
  display: inline-block;
  font-family: 'Roboto Mono';
  background: ${({ theme }) => theme.bg};
  padding: 7px 9px;
  border-radius: 4px;
  line-height: 1em;
  font-size: 16px;
`;
