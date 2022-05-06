import React from 'react';
import styled from 'styled-components';
import { USER_ROLES } from '../hooks/index.js';

type Role = 'none' | 'viewer' | 'user' | 'admin' | 'super admin';

type Props = {
  role: USER_ROLES;
};

const RoleBadge: React.FC<Props> = ({ role }) => {
  const roles: Role[] = ['none', 'viewer', 'user', 'admin', 'super admin'];
  const roleName = roles[Math.max(0, Math.min(role, USER_ROLES.SUPERADMIN))];

  return <RoleBadgeWrapper role={roleName}>{roleName}</RoleBadgeWrapper>;
};

export default RoleBadge;

// Elements

type RoleBadgeProps = {
  role: Role;
};

const RoleBadgeWrapper = styled.div<RoleBadgeProps>`
  display: inline-block;
  vertical-align: text-bottom;
  font-size: 11px;
  font-weight: 500;
  line-height: 1em;
  letter-spacing: 0.05em;
  padding: 4px 8px;
  align-self: center;
  border-radius: 4px;
  color: ${({ theme }) => theme.fg};
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
