import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Link } from 'react-router-dom';
import PageGroup from '../components/page-group/index.js';
import Navigation from '../components/navigation/index.js';
import ServerStateBanner from '../components/server-state-banner/index.js';
import { useLighthouse, useAppState } from '../hooks/index.js';
import { getUrlQuery } from '../lib/utils.js';

const Dashboard = () => {
  const { data, section } = useLighthouse();
  const appState = useAppState();

  const { token } = getUrlQuery();

  return data ? (
    <ThemeProvider
      theme={{ itemLayout: appState.comparedMode ? 'compared' : 'standard' }}
    >
      <ServerStateBanner />
      <Wrapper>
        <NavWrapper>
          <HeaderWrapper>
            <Header1>Lighthouse dashboard</Header1>
            <Header2>
              <Link to={`/${token ? `?token=${token}` : ''}`}>Sections</Link> /{' '}
              {data.name}
            </Header2>
          </HeaderWrapper>
          <ControlsWrapper>
            <Navigation section={section} />
          </ControlsWrapper>
        </NavWrapper>
        {data.pageGroups.map((pageGroup, i) => (
          <PageGroup
            key={pageGroup._id}
            mode="dashboard"
            pageGroup={pageGroup}
          />
        ))}
      </Wrapper>
    </ThemeProvider>
  ) : null;
};

export default Dashboard;

const Wrapper = styled.div`
  padding: 50px;
`;

const NavWrapper = styled.div`
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
`;

const HeaderWrapper = styled.div``;

const Header1 = styled.h1`
  text-align: left;
  font-weight: 300;
  font-size: 40px;
  margin: 0 0 10px 0;
`;

const Header2 = styled.h2`
  text-align: left;
  font-weight: 400;
  margin: 0 0 4vh 0;
`;

const ControlsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;
