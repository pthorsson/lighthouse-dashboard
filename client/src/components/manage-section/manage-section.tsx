import React, { useState } from 'react';
import Modal, {
  useModal,
  ModalHeader,
  ModalSubHeader,
  ModalSection,
} from '@ui/modal';
import { useLighthouse } from '@hooks';

import SectionSettings from './section-settings';
import DeleteSection from './delete-section';
import DeletePageGroup from './delete-page-group';
import PageGroupSettings from './page-group-settings';
import ManagePageGroups from './manage-page-groups';
import ManagePageGroupPages from './manage-page-group-pages';

const ManageSection: React.FC = () => {
  const { data } = useLighthouse();
  const managePageGroupModal = useModal('manage-page-group-modal');
  const [selectedPageGroup, setSelectedPageGroup] = useState(null);

  const pageGroup = data.pageGroups.find(pg => pg._id === selectedPageGroup);

  return (
    <>
      <Modal id="manage-section-modal">
        <ModalHeader>Manage section</ModalHeader>
        <ModalSubHeader>{data.name}</ModalSubHeader>
        <ModalSection sectionTitle="Section settings">
          <SectionSettings section={data} />
        </ModalSection>
        <ModalSection sectionTitle="Page groups">
          <ManagePageGroups
            pageGroups={data.pageGroups}
            selectPageGroup={pageGroup => {
              managePageGroupModal.toggle();
              setSelectedPageGroup(pageGroup);
            }}
          />
        </ModalSection>
        <ModalSection sectionTitle="Delete section">
          <DeleteSection section={data} />
        </ModalSection>
      </Modal>
      {pageGroup && (
        <Modal id="manage-page-group-modal" backButton={true}>
          <ModalHeader>Manage page group</ModalHeader>
          <ModalSubHeader>
            {pageGroup.namePrefix} {pageGroup.name} {pageGroup.nameSuffix}
          </ModalSubHeader>
          <ModalSection sectionTitle="Page group settings">
            <PageGroupSettings pageGroup={pageGroup} />
          </ModalSection>
          <ModalSection sectionTitle="Pages">
            <ManagePageGroupPages pageGroup={pageGroup} />
          </ModalSection>
          <ModalSection sectionTitle="Delete page group">
            <DeletePageGroup pageGroup={pageGroup} />
          </ModalSection>
        </Modal>
      )}
    </>
  );
};

export default ManageSection;
