import React from 'react';
import styled from 'styled-components';
import { EnsureUserRole, USER_ROLES, useAppState } from '@hooks';
import { Button } from '@ui/buttons';
import { useModal } from '@ui/modal';
import Checkbox from '@ui/checkbox';
import DropMenu, {
  DropDownDivider,
  DropDownItem,
  DropDownTitle,
  useDropMenu,
} from '@ui/drop-menu';
import Icon from '@ui/icon';
import ManageSection from '@components/manage-section';
import ManageTokens from '@components/manage-tokens';
import ManageUsers from '@components/manage-users';
import AboutApp from '@components/about-app';

import UserInfo from './user-info';
import Actions from './actions';
import { getUrlQuery } from '@lib/utils';

type Props = {
  section?: string;
};

const Navigation: React.FC<Props> = ({ section }) => {
  const manageSectionModal = useModal('manage-section-modal');
  const manageTokensModal = useModal('manage-tokens-modal');
  const manageUsersModal = useModal('manage-users-modal');
  const applicationInfoModal = useModal('application-info-modal');
  const dropMenu = useDropMenu('navigation');
  const appState = useAppState();

  const { token } = getUrlQuery();

  return (
    <>
      <Wrapper>
        <UserInfo />
        <NavItems>
          {section && (
            <EnsureUserRole role={USER_ROLES.USER}>
              <Actions />
            </EnsureUserRole>
          )}
          <EnsureUserRole
            role={USER_ROLES.VIEWER}
            requireLoggedInUser={!section}
          >
            <Button size="large" square onClick={() => dropMenu.toggle()}>
              <Icon type="burger" />
            </Button>
          </EnsureUserRole>
        </NavItems>
        <DropMenu id="navigation" posX="right">
          {section && (
            <>
              <DropDownTitle>Section</DropDownTitle>
              <DropDownItem
                type="route"
                to={`/${section}/display${token ? `?token=${token}` : ''}`}
              >
                Enter display mode
              </DropDownItem>
              <DropDownItem type="wrapper" closeOnClick={false}>
                <Checkbox
                  justifyContent="space-between"
                  reverse
                  checked={appState.comparedMode}
                  onChange={() =>
                    appState.setState({ comparedMode: !appState.comparedMode })
                  }
                >
                  Compared view
                </Checkbox>
              </DropDownItem>
              <EnsureUserRole role={USER_ROLES.ADMIN} requireLoggedInUser>
                <DropDownItem
                  type="button"
                  onClick={() => manageSectionModal.toggle(true)}
                >
                  Settings
                </DropDownItem>
              </EnsureUserRole>
              <EnsureUserRole role={USER_ROLES.SUPERADMIN} requireLoggedInUser>
                <DropDownItem type="route" to={`/log/section/${section}`}>
                  Latest audit log
                </DropDownItem>
              </EnsureUserRole>
            </>
          )}
          {section && (
            <EnsureUserRole role={USER_ROLES.USER} requireLoggedInUser>
              <DropDownDivider />
            </EnsureUserRole>
          )}
          <EnsureUserRole role={USER_ROLES.USER} requireLoggedInUser>
            <DropDownTitle>User</DropDownTitle>
            <DropDownItem
              type="button"
              onClick={() => manageTokensModal.toggle(true)}
            >
              Manage tokens
            </DropDownItem>
            <EnsureUserRole role={USER_ROLES.SUPERADMIN}>
              <DropDownItem
                type="button"
                onClick={() => manageUsersModal.toggle(true)}
              >
                Manage users
              </DropDownItem>
            </EnsureUserRole>
          </EnsureUserRole>
          <EnsureUserRole role={USER_ROLES.SUPERADMIN} requireLoggedInUser>
            <DropDownDivider />
            <DropDownTitle>Application</DropDownTitle>
            <DropDownItem
              type="button"
              onClick={() => applicationInfoModal.toggle(true)}
            >
              Info
            </DropDownItem>
            <DropDownItem type="route" to={'/log/calibration'}>
              Calibration audit log
            </DropDownItem>
          </EnsureUserRole>
        </DropMenu>
      </Wrapper>
      {section && (
        <EnsureUserRole role={USER_ROLES.ADMIN} requireLoggedInUser>
          <ManageSection />
        </EnsureUserRole>
      )}
      <EnsureUserRole role={USER_ROLES.USER} requireLoggedInUser>
        <ManageTokens />
      </EnsureUserRole>
      <EnsureUserRole role={USER_ROLES.SUPERADMIN} requireLoggedInUser>
        <ManageUsers />
      </EnsureUserRole>
      <EnsureUserRole role={USER_ROLES.SUPERADMIN} requireLoggedInUser>
        <AboutApp />
      </EnsureUserRole>
    </>
  );
};

export default Navigation;

// Elements

const Wrapper = styled.div`
  position: relative;
  align-self: flex-start;
`;

const NavItems = styled.div`
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 12px;

  > * {
    margin-left: ${({ theme }) => theme.gridGap}px;
    margin-top: ${({ theme }) => theme.gridGap}px;
  }
`;
