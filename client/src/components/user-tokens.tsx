import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useApi, API_STATE, USER_ROLES, useCurrentUser } from '@hooks';
import Modal, { ModalHeader, ModalSection } from '@ui/modal';
import { copyToClipboard } from '@lib/utils';
import { Button } from '@ui/buttons';

const ROLES = ['None', 'Viewer', 'User'];

const UserTokens: React.FC = () => {
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

  return (
    <Modal id="user-tokens-modal">
      <ModalHeader>User tokens</ModalHeader>
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
              <TokenRole>Role: {ROLES[token.role]}</TokenRole>
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
          <div>No tokens has been added yet</div>
        ) : null}
      </ModalSection>
      <ModalSection sectionTitle="Add new token">
        {currentUser.role >= USER_ROLES.USER && (
          <RadioButtonWrapper>
            <RadioButton
              type="radio"
              id="viewer-role"
              disabled={createToken.state === API_STATE.FETCHING}
              onClick={() => setNewTokenRole(USER_ROLES.VIEWER)}
              checked={newTokenRole === USER_ROLES.VIEWER}
              readOnly
            />
            <RadioButtonLabel htmlFor="viewer-role">
              Viewer role privileges - Can visit application as viewer
            </RadioButtonLabel>
          </RadioButtonWrapper>
        )}
        {currentUser.role >= USER_ROLES.ADMIN && (
          <RadioButtonWrapper>
            <RadioButton
              type="radio"
              id="user-role"
              disabled={createToken.state === API_STATE.FETCHING}
              onClick={() => setNewTokenRole(USER_ROLES.USER)}
              checked={newTokenRole === USER_ROLES.USER}
              readOnly
            />
            <RadioButtonLabel htmlFor="user-role">
              User role privileges - Can visit application as user and trigger
              audits
            </RadioButtonLabel>
          </RadioButtonWrapper>
        )}
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

export default UserTokens;

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
  align-items: center;
  background: ${({ theme }) => theme.bg};
  padding: ${({ theme }) => theme.gridGap}px;
  margin-left: ${({ theme }) => theme.gridGap}px;
  font-family: 'Roboto Mono';
  font-size: 13px;
  line-height: 1em;
`;

const RadioButtonWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.gridGap * 2}px;
`;

const RadioButton = styled.input`
  margin-right: 8px;
`;

const RadioButtonLabel = styled.label``;
