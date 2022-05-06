import React, { useState, useEffect, useCallback } from 'react';
import { API_STATE, useApi } from '../../hooks/index.js';
import Modal, {
  ModalHeader,
  ModalSection,
  ModalSubHeader,
  useModal,
} from '../../ui/modal/index.js';

import ExistingUsers from './existing-users.js';
import CreateUser from './create-user.js';
import UserSettings from './user-settings.js';
import DeleteUser from './delete-user.js';

const ManageUsers: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<Lhd.User>(null);
  const editUserModal = useModal('user-settings-modal');
  const getUsers = useApi<Lhd.User[]>('/api/admin/user', {
    runOnMount: true,
  });
  const selectUser = useCallback(
    (userId: string) =>
      setSelectedUser(getUsers.data.find(({ _id }) => _id === userId)),
    [getUsers.data, selectedUser]
  );

  // Updates the User settings modal data after fetching users, if selected user
  useEffect(() => {
    if (getUsers.state === API_STATE.SUCCESS && selectedUser) {
      setSelectedUser(
        getUsers.data.find(({ _id }) => _id === selectedUser._id)
      );
    }
  }, [getUsers.state, selectedUser]);

  return (
    <>
      <Modal id="manage-users-modal">
        <ModalHeader>Manage users</ModalHeader>
        <ModalSection sectionTitle="Existing users">
          <ExistingUsers
            users={getUsers.data}
            selectUser={(user) => {
              editUserModal.toggle();
              selectUser(user._id);
            }}
          />
        </ModalSection>
        <ModalSection sectionTitle="Add new user">
          <CreateUser onChange={getUsers.exec} />
        </ModalSection>
      </Modal>
      {selectedUser && (
        <Modal id="user-settings-modal" backButton={true}>
          <ModalHeader>User settings</ModalHeader>
          <ModalSubHeader>{selectedUser.email}</ModalSubHeader>
          <ModalSection sectionTitle="Edit user">
            <UserSettings user={selectedUser} onChange={getUsers.exec} />
          </ModalSection>
          <ModalSection sectionTitle="Delete user">
            <DeleteUser user={selectedUser} onChange={getUsers.exec} />
          </ModalSection>
        </Modal>
      )}
    </>
  );
};

export default ManageUsers;
