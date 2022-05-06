import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import ErrorScreen from '../components/error-screen/index.js';
import { useApi, API_STATE } from '../hooks/index.js';

type Props = {
  type: 'calibration' | 'section';
};

const Log: React.FC<Props> = ({ type }) => {
  const { section } = useParams<{ section: string }>();
  const apiUrl = {
    calibration: '/api/admin/info/calibration-log',
    section: `/api/admin/info/section-log/${section}`,
  };
  const { data, state } = useApi<string[]>(apiUrl[type], {
    runOnMount: true,
  });

  return state === API_STATE.SUCCESS && data ? (
    <Wrapper>
      <Header>
        <HeaderCell>Lighthouse Dashboard logs</HeaderCell>
        <HeaderCell>
          {type === 'section'
            ? `Latest section run for "${section}"`
            : 'Latest calibration run'}
        </HeaderCell>
      </Header>
      <LogContent>
        {data.map((line, i) => (
          <LogRow key={i}>
            <LogRowNumber>{i + 1}</LogRowNumber>
            <LogRowContent>{line}</LogRowContent>
          </LogRow>
        ))}
      </LogContent>
    </Wrapper>
  ) : state === API_STATE.ERROR ? (
    <ErrorScreen
      header="Not found"
      message="This log could not be found"
      link={{
        href: '/',
        text: 'Back to landing page',
      }}
    />
  ) : null;
};

export default Log;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  background: ${({ theme }) => theme.bg};
  flex: 0 0 auto;
  justify-content: space-between;
  padding: 10px 20px;
`;

const HeaderCell = styled.div``;

const LogContent = styled.div`
  display: grid;
  grid-template-columns: max-content auto;
  flex: 0 1 auto;
  font-family: 'Roboto Mono';
  font-weight: 400;
  font-size: 13px;
  color: #e5e5e5;
  overflow-y: scroll;
  padding: 20px 0px;
`;

const LogRow = styled.div`
  display: contents;

  :hover > * {
    background: #353535;
    color: #ffffff;
  }

  :first-child > * {
    border-top: 1px solid #353535;
  }
`;

const LogRowNumber = styled.div`
  padding: 1px 10px 1px 20px;
  text-align: right;
  color: #707070;
  border-right: 1px solid #353535;
  border-bottom: 1px solid #353535;
`;

const LogRowContent = styled.div`
  padding: 1px 20px 1px 10px;
  border-bottom: 1px solid #353535;
`;
