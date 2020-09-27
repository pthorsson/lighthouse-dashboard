import React from 'react';
import styled from 'styled-components';
import { useApi, API_STATE, USER_ROLES, useCurrentUser } from '@hooks';
import { Button } from '@ui/buttons';
import Icon from '@ui/icon';

const ROLES = ['None', 'Viewer', 'User', 'Admin', 'Super admin'];

type Props = {
  users: Lhd.User[];
  selectUser: (user: Lhd.User) => void;
};

const ExistingUsers: React.FC<Props> = ({ users, selectUser }) => {
  const currentUser = useCurrentUser();

  const deleteUser = useApi('/api/admin/user/:userId', {
    method: 'DELETE',
    delay: 300,
  });

  return users?.length ? (
    <>
      {users.map(user => (
        <UserWrapper key={user._id}>
          <UserEmail>{user.email}</UserEmail>
          <UserRole>
            {ROLES[Math.min(user.role, USER_ROLES.SUPERADMIN)]}
          </UserRole>
          <Button
            adaptive
            style={{ marginLeft: 4 }}
            disabled={
              deleteUser.state === API_STATE.FETCHING ||
              currentUser.id === user._id
            }
            onClick={() => {
              selectUser(user);
            }}
          >
            Settings
            <Icon type="edit" style={{ marginLeft: 6, height: 14 }} />
          </Button>
        </UserWrapper>
      ))}
    </>
  ) : (
    <></>
  );
};

export default ExistingUsers;

// Elements

const UserWrapper = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.gridGap}px;
`;

const UserEmail = styled.div`
  white-space: nowrap;
  background: ${({ theme }) => theme.bg};
  padding: ${({ theme }) => theme.gridGap}px;
  flex: 1 1 auto;
  overflow: hidden;
  font-family: 'Roboto Mono';
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.bg};
  padding: ${({ theme }) => theme.gridGap}px;
  font-family: 'Roboto Mono';
  font-size: 13px;
  line-height: 1em;
  white-space: nowrap;
`;
