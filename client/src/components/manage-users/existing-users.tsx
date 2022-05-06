import React from 'react';
import styled from 'styled-components';
import { useApi, API_STATE, useCurrentUser } from '../../hooks/index.js';
import { Button } from '../../ui/buttons.js';
import Icon from '../../ui/icon.js';
import RoleBadge from '../../ui/role-badge.js';

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
      {users.map((user) => (
        <UserWrapper key={user._id}>
          <UserEmail>{user.email}</UserEmail>
          <UserRole>
            <RoleBadge role={user.role} />
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
`;
