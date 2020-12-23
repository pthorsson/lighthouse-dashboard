import React from 'react';
import styled from 'styled-components';
import { useCurrentUser } from '@hooks';
import RoleBadge from '@ui/role-badge';

const UserInfo: React.FC = () => {
  const { email, role } = useCurrentUser();

  return (
    <Wrapper>
      <UsernameLabel>
        {!email ? (
          <>Verified token</>
        ) : (
          <>
            Logged in as <Username>{email}</Username>
          </>
        )}
      </UsernameLabel>
      <RoleBadge role={role} />
    </Wrapper>
  );
};

export default UserInfo;

// Elements

const Wrapper = styled.div`
  display: flex;
  height: 24px;
  flex-direction: row;
  justify-content: flex-end;
`;

const UsernameLabel = styled.div`
  align-self: center;
  font-size: 16px;
  padding: 0 8px;
  line-height: 1em;
`;

const Username = styled.div`
  display: inline;
  font-weight: 500;
`;
