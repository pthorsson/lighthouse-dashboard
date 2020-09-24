import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Link } from 'react-router-dom';
import PageGroup from '@components/page-group';
import ManageSection from '@components/manage-section';
import CurrentUserInfo from '@components/current-user-info';
import { useModal } from '@ui/modal';
import { EnsureUserRole, useLighthouse, useApi, USER_ROLES } from '@hooks';
import { Button, RouteLinkButton } from '@ui/buttons';

const Dashboard = () => {
  const { data, state, section } = useLighthouse();
  const manageSectionModal = useModal('manage-section-modal');
  const [itemLayout, setItemLayout] = useState('standard');
  const triggerAllAudits = useApi(`/api/actions/trigger-all-audits/${section}`);
  const removeAllQueuedAudits = useApi(
    `/api/actions/remove-all-queued-audits/${section}`
  );

  return data ? (
    <ThemeProvider theme={{ itemLayout }}>
      <Wrapper>
        <NavWrapper>
          <HeaderWrapper>
            <Header1>Lighthouse dashboard</Header1>
            <Header2>
              <Link to="/">Sections</Link> / {data.name}
            </Header2>
          </HeaderWrapper>
          <ControlsWrapper>
            <CurrentUserInfo />
            <Actions>
              <EnsureUserRole role={USER_ROLES.ADMIN}>
                <Button
                  size="large"
                  onClick={() => manageSectionModal.toggle()}
                >
                  Manage section
                </Button>
              </EnsureUserRole>
              <EnsureUserRole role={USER_ROLES.USER}>
                <Button size="large" onClick={() => triggerAllAudits.exec()}>
                  Trigger all audits
                </Button>
                <Button
                  size="large"
                  onClick={() => removeAllQueuedAudits.exec()}
                  disabled={!state.queue.length}
                >
                  Clear audit queue
                </Button>
              </EnsureUserRole>
              <Button
                size="large"
                onClick={() => {
                  setItemLayout(
                    itemLayout === 'standard' ? 'compared' : 'standard'
                  );
                }}
              >
                Compare mode
              </Button>
              <RouteLinkButton to={`/${section}/display`} size="large">
                Display mode
              </RouteLinkButton>
            </Actions>
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
      <ManageSection />
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

const Actions = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 10px;

  > * {
    margin-left: ${({ theme }) => theme.gridGap}px;
  }
`;
