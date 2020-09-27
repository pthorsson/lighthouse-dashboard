import React from 'react';
import styled from 'styled-components';
import { Button } from '@ui/buttons';
import { TextInput, FormSection, InputLabel } from '@ui/inputs';
import { useApi, API_STATE, useObjectState, USER_ROLES } from '@hooks';

type UpdateUserPayload = {
  email: string;
  role: USER_ROLES;
};

type Props = {
  user: Lhd.User;
  onChange: () => void;
};

const UserSettings: React.FC<Props> = ({ user, onChange }) => {
  const updateUser = useApi(`/api/admin/user/${user._id}`, {
    method: 'PUT',
    delay: 300,
  });
  const [form, setForm] = useObjectState<UpdateUserPayload>({
    email: user.email,
    role: user.role,
  });

  let errorMessage;

  if (updateUser.error) {
    errorMessage =
      updateUser.error.message || `Error (${updateUser.error.type})`;
  }

  return (
    <>
      <FormSection marginBottom="20px">
        <InputLabel>Email</InputLabel>
        <TextInput
          type="text"
          placeholder="Email"
          onChange={e => setForm({ email: e.target.value })}
          value={form.email}
          disabled={updateUser.state === API_STATE.FETCHING}
        />
      </FormSection>
      <FormSection>
        <InputLabel>Role</InputLabel>
        <RoleSelect
          onChange={e => setForm({ role: e.target.value as any })}
          defaultValue={user.role}
          disabled={updateUser.state === API_STATE.FETCHING}
        >
          <RoleSelectOption value={2}>User</RoleSelectOption>
          <RoleSelectOption value={3}>Admin</RoleSelectOption>
          <RoleSelectOption value={4}>Super admin</RoleSelectOption>
        </RoleSelect>
      </FormSection>
      <FormSection>
        <Button
          size="large"
          disabled={
            (form.email === user.email && form.role === user.role) ||
            updateUser.state === API_STATE.FETCHING
          }
          onClick={async () => {
            await updateUser.exec({ payload: form });
            onChange();
          }}
        >
          Save
        </Button>
      </FormSection>
      {errorMessage}
    </>
  );
};

export default UserSettings;

// Elements

const RoleSelect = styled.select``;

const RoleSelectOption = styled.option``;

const RoleDescription = styled.div`
  margin-top: 20px;
`;
