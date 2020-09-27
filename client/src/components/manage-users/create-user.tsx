import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useApi, API_STATE, USER_ROLES, useObjectState } from '@hooks';
import { Button } from '@ui/buttons';
import { FormSection, InputLabel, TextInput } from '@ui/inputs';

const roleDescriptions: string[] = [];

roleDescriptions[USER_ROLES.USER] =
  'Role "user" allows the user to trigger/clear audits and manage tokens';
roleDescriptions[USER_ROLES.ADMIN] =
  'Role "user" allows the user to trigger/clear audits and manage tokens and sections';
roleDescriptions[USER_ROLES.SUPERADMIN] =
  'Role "user" allows the user to trigger/clear audits and manage tokens, sections and users';

type CreateUserPayload = {
  email: string;
  role: USER_ROLES;
};

type Props = {
  onChange: () => void;
};

const CreateUser: React.FC<Props> = ({ onChange }) => {
  const createUser = useApi('/api/admin/user', {
    method: 'POST',
  });
  const [newUserForm, setNewUserForm] = useObjectState<CreateUserPayload>({
    email: '',
    role: USER_ROLES.USER,
  });

  useEffect(() => {
    if (createUser.state === API_STATE.SUCCESS) {
      setNewUserForm({ email: '', role: USER_ROLES.USER });
    }
  }, [createUser.state]);

  let createErrorMessage;

  if (createUser.error) {
    createErrorMessage =
      createUser.error.message || `Error (${createUser.error.type})`;
  }

  return (
    <>
      <FormSection>
        <InputLabel>Email (case sensitive)</InputLabel>
        <TextInput
          value={newUserForm.email}
          onChange={e => setNewUserForm({ email: e.target.value })}
        />
      </FormSection>
      <FormSection>
        <InputLabel>Role</InputLabel>
        <RoleSelect
          onChange={e => setNewUserForm({ role: e.target.value as any })}
        >
          <RoleSelectOption value={2}>User</RoleSelectOption>
          <RoleSelectOption value={3}>Admin</RoleSelectOption>
          <RoleSelectOption value={4}>Super admin</RoleSelectOption>
        </RoleSelect>
        <RoleDescription>{roleDescriptions[newUserForm.role]}</RoleDescription>
      </FormSection>
      <FormSection>
        <Button
          size="large"
          style={{ marginLeft: 4 }}
          disabled={createUser.state === API_STATE.FETCHING}
          onClick={async () => {
            await createUser.exec({ payload: newUserForm });
            onChange();
          }}
        >
          Create user
        </Button>
      </FormSection>
      {createErrorMessage}
    </>
  );
};

export default CreateUser;

// Elements

const RoleSelect = styled.select``;

const RoleSelectOption = styled.option``;

const RoleDescription = styled.div`
  margin-top: 20px;
`;
