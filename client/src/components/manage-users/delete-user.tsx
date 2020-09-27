import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '@ui/buttons';
import { useModal } from '@ui/modal';
import { TextInput, InputLabel, FormSection } from '@ui/inputs';
import { useApi, API_STATE } from '@hooks';

type Props = {
  user: Lhd.User;
  onChange: () => void;
};

const DeleteUser: React.FC<Props> = ({ user, onChange }) => {
  const { back } = useModal('user-settings-modal');
  const [userEmail, setUserEmail] = useState('');
  const deleteUser = useApi(`/api/admin/user/${user._id}`, {
    method: 'DELETE',
    delay: 300,
  });

  useEffect(() => {
    if (deleteUser.state === API_STATE.SUCCESS) {
      onChange();
      back();
    }
  }, [deleteUser.state]);

  return (
    <>
      <Warning>
        WARNING! When deleting a user you will also delete any tokens that the
        user may have created.
      </Warning>
      <FormSection marginBottom="20px">
        <InputLabel>Enter the email ({user.email}) of the user.</InputLabel>
        <TextInput
          type="text"
          placeholder={user.email}
          onChange={e => setUserEmail(e.target.value)}
          value={userEmail}
          disabled={deleteUser.state === API_STATE.FETCHING}
        />
      </FormSection>
      <Button
        size="large"
        disabled={
          userEmail !== user.email || deleteUser.state === API_STATE.FETCHING
        }
        onClick={() => deleteUser.exec()}
        warning
      >
        Delete user {user.email}
      </Button>
    </>
  );
};

export default DeleteUser;

const Warning = styled.p`
  margin: 30px 0;
`;
