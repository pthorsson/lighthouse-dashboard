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
          <Button size="large" square onClick={() => dropMenu.toggle()}>
            <Icon type="burger" />
          </Button>
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
              <EnsureUserRole role={USER_ROLES.ADMIN}>
                <DropDownItem
                  type="button"
                  onClick={() => manageSectionModal.toggle(true)}
                >
                  Settings
                </DropDownItem>
              </EnsureUserRole>
              <EnsureUserRole role={USER_ROLES.USER}>
                <DropDownDivider />
              </EnsureUserRole>
            </>
          )}
          <EnsureUserRole role={USER_ROLES.USER}>
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
        </DropMenu>
      </Wrapper>
      {section && (
        <EnsureUserRole role={USER_ROLES.ADMIN}>
          <ManageSection />
        </EnsureUserRole>
      )}
      <EnsureUserRole role={USER_ROLES.USER}>
        <ManageTokens />
      </EnsureUserRole>
      <EnsureUserRole role={USER_ROLES.SUPERADMIN}>
        <ManageUsers />
      </EnsureUserRole>
    </>
  );
};

export default Navigation;

// Elements

const Wrapper = styled.div`
  position: relative;
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
