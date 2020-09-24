import React, { useState } from 'react';
import styled from 'styled-components';
import Modal, { useModal } from '@ui/modal';
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
        <SettingsSection title="Section settings">
          <SectionSettings section={data} />
        </SettingsSection>
        <SettingsSection title="Page groups">
          <ManagePageGroups
            pageGroups={data.pageGroups}
            selectPageGroup={pageGroup => {
              managePageGroupModal.toggle();
              setSelectedPageGroup(pageGroup);
            }}
          />
        </SettingsSection>
        <SettingsSection title="Delete section">
          <DeleteSection section={data} />
        </SettingsSection>
      </Modal>
      {pageGroup && (
        <Modal id="manage-page-group-modal" backButton={true}>
          <ModalHeader>Manage page group</ModalHeader>
          <ModalSubHeader>
            {pageGroup.namePrefix} {pageGroup.name} {pageGroup.nameSuffix}
          </ModalSubHeader>
          <SettingsSection title="Page group settings">
            <PageGroupSettings pageGroup={pageGroup} />
          </SettingsSection>
          <SettingsSection title="Pages">
            <ManagePageGroupPages pageGroup={pageGroup} />
          </SettingsSection>
          <SettingsSection title="Delete page group">
            <DeletePageGroup pageGroup={pageGroup} />
          </SettingsSection>
        </Modal>
      )}
    </>
  );
};

export default ManageSection;

// Elements

const ModalHeader = styled.h2`
  text-align: center;
  font-weight: 400;
  margin: 0 0 10px 0;
`;

const ModalSubHeader = styled.h2`
  text-align: center;
  font-weight: 400;
  font-size: 16px;
  margin: 0 0 30px 0;
`;

/**
 *
 */

type SettingsSectionProps = { title: string };

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <SettingsSectionWrapper>
      <SettingsSectionTitle>{title}</SettingsSectionTitle>
      {children}
    </SettingsSectionWrapper>
  );
};

const SettingsSectionWrapper = styled.div`
  margin: 40px 0 0 0;
`;

const SettingsSectionTitle = styled.h3`
  display: block;
  font-weight: 400;
  font-size: 16px;
  padding-bottom: 10px;
  margin: 0 0 30px 0;
  border-bottom: 1px solid ${({ theme }) => theme.bg};
`;
