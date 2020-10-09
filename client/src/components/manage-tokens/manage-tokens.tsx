import React, { useState } from 'react';
import styled from 'styled-components';
import { useApi, API_STATE, USER_ROLES, useCurrentUser } from '@hooks';
import Modal, { ModalHeader, ModalSection } from '@ui/modal';
import { copyToClipboard } from '@lib/utils';
import { Button } from '@ui/buttons';
import RoleBadge from '@ui/role-badge';

const ManageTokens: React.FC = () => {
  const currentUser = useCurrentUser();
  const [newTokenRole, setNewTokenRole] = useState(USER_ROLES.VIEWER);
  const getTokens = useApi<Lhd.Token[]>('/api/token', {
    runOnMount: true,
  });
  const createToken = useApi('/api/token', {
    method: 'POST',
    delay: 300,
  });
  const deleteToken = useApi('/api/token/:tokenId', {
    method: 'DELETE',
    delay: 300,
  });

  const tokenRoles = [];

  if (currentUser.role >= USER_ROLES.USER) {
    tokenRoles.push({
      role: USER_ROLES.VIEWER,
      description: 'Can view application',
    });
  }

  if (currentUser.role >= USER_ROLES.ADMIN) {
    tokenRoles.push({
      role: USER_ROLES.USER,
      description: 'Can view application and trigger audits',
    });
  }

  if (currentUser.role >= USER_ROLES.SUPERADMIN) {
    tokenRoles.push({
      role: USER_ROLES.ADMIN,
      description: 'Can view application, trigger audits and manage sections',
    });
  }

  return (
    <Modal id="manage-tokens-modal">
      <ModalHeader>Manage tokens</ModalHeader>
      <Description>
        Tokens can be used to visit the application and access certain API
        endpoint without being logged in. This can be for example to share the
        section display page or to trigger audits with web hooks.
        <br />
        <br />
        Append <CodeSample>?token=your-token</CodeSample> to the url you want to
        access.
      </Description>
      <ModalSection sectionTitle="Existing tokens">
        {getTokens.data?.length ? (
          getTokens.data.map(token => (
            <TokenWrapper key={token._id}>
              <TokenToken>{truncateToken(token.token)}</TokenToken>
              <TokenRole>
                <RoleBadge role={token.role} />
              </TokenRole>
              <Button
                adaptive
                style={{ marginLeft: 4 }}
                onClick={async () => {
                  await copyToClipboard(token.token);
                }}
              >
                Copy
              </Button>
              <Button
                adaptive
                warning
                style={{ marginLeft: 4 }}
                disabled={deleteToken.state === API_STATE.FETCHING}
                onClick={async () => {
                  await deleteToken.exec({ params: { tokenId: token._id } });
                  getTokens.exec();
                }}
              >
                Delete
              </Button>
            </TokenWrapper>
          ))
        ) : getTokens.state === API_STATE.SUCCESS ? (
          <>No tokens has been added yet</>
        ) : null}
      </ModalSection>
      <ModalSection sectionTitle="Add new token">
        {tokenRoles.map(tokenRole => (
          <RadioButtonWrapper key={tokenRole.role}>
            <RadioButton
              type="radio"
              id={`role-${tokenRole.role}`}
              disabled={createToken.state === API_STATE.FETCHING}
              onClick={() => setNewTokenRole(tokenRole.role)}
              checked={newTokenRole === tokenRole.role}
              readOnly
            />
            <RadioButtonLabel htmlFor={`role-${tokenRole.role}`}>
              <RoleBadge role={tokenRole.role} /> {tokenRole.description}
            </RadioButtonLabel>
          </RadioButtonWrapper>
        ))}
        <Button
          size="large"
          style={{ marginTop: 30 }}
          disabled={createToken.state === API_STATE.FETCHING}
          onClick={async () => {
            await createToken.exec({ payload: { role: newTokenRole } });
            setNewTokenRole(USER_ROLES.VIEWER);
            getTokens.exec();
          }}
        >
          Create token
        </Button>
      </ModalSection>
    </Modal>
  );
};

export default ManageTokens;

const truncateToken = (token: string) =>
  token.substring(0, 10) + '***********************';

// Elements

const Description = styled.div`
  margin: 40px 0 10px 0;
`;

const CodeSample = styled.div`
  display: inline-block;
  font-family: 'Roboto Mono';
  background: ${({ theme }) => theme.bg};
  padding: 4px 6px;
  border-radius: 2px;
  line-height: 1em;
  font-size: 13px;
`;

const TokenWrapper = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.gridGap}px;
`;

const TokenToken = styled.div`
  white-space: nowrap;
  background: ${({ theme }) => theme.bg};
  padding: ${({ theme }) => theme.gridGap}px;
  overflow: hidden;
  font-family: 'Roboto Mono';
  text-overflow: ellipsis;
`;

const TokenRole = styled.div`
  display: flex;
  flex: 1 1 auto;
  justify-content: flex-end;
  background: ${({ theme }) => theme.bg};
  padding: ${({ theme }) => theme.gridGap}px;
`;

const RadioButtonWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.gridGap * 2}px;
`;

const RadioButton = styled.input`
  margin-right: 8px;
`;

const RadioButtonLabel = styled.label``;
