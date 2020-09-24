import React from 'react';
import styled from 'styled-components';
import { useCurrentUser, USER_ROLES } from '@hooks';

type Role = 'none' | 'viewer' | 'user' | 'admin' | 'super admin';

const CurrentUserInfo: React.FC = () => {
  const { email, role } = useCurrentUser();

  const roles: Role[] = ['none', 'viewer', 'user', 'admin', 'super admin'];
  const roleName = roles[Math.max(0, Math.min(role, USER_ROLES.SUPERADMIN))];

  return (
    <Wrapper>
      <Username>
        {!email && role === USER_ROLES.VIEWER ? (
          <>Verified token</>
        ) : (
          <>Logged in as {email}</>
        )}
      </Username>
      <RoleBadge role={roleName}>{roleName}</RoleBadge>
    </Wrapper>
  );
};

export default CurrentUserInfo;

// Elements

const Wrapper = styled.div`
  display: flex;
  height: 24px;
  flex-direction: row;
`;

const Username = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 0 6px;
  line-height: 1em;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.fg};
`;

type RoleBadgeProps = {
  role: Role;
};

const RoleBadge = styled.div<RoleBadgeProps>`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: ${({ theme }) => theme.fg};
  padding: 0 6px;
  background: ${({ role }) => {
    switch (role) {
      case 'none':
        return '#808080';
      case 'viewer':
        return '#6c9e60';
      case 'user':
        return '#5fa398';
      case 'admin':
        return '#5d7da3';
      case 'super admin':
        return '#715da3';
    }
  }};
`;
