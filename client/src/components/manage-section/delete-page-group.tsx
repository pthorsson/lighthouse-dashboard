import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '@ui/buttons';
import { useModal } from '@ui/modal';
import { TextInput, InputLabel, FormSection } from '@ui/inputs';
import { useApi, API_STATE } from '@hooks';

type Props = {
  pageGroup: Lhd.PageGroup;
};

const DeleteSection: React.FC<Props> = ({ pageGroup }) => {
  const { back } = useModal('manage-page-group-modal');
  const [pageGroupName, setPageGroupName] = useState('');
  const deletePageGroup = useApi(`/api/admin/page-group/${pageGroup._id}`, {
    method: 'DELETE',
    delay: 300,
  });

  useEffect(() => {
    if (deletePageGroup.state === API_STATE.SUCCESS) {
      back();
    }
  }, [deletePageGroup.state]);

  return (
    <>
      <Warning>
        WARNING! When deleting a page group you will also delete everything
        under it. That includes pages, audits and reports.
      </Warning>
      <FormSection marginBottom="20px">
        <InputLabel>
          Enter the name ({pageGroup.name}) of the page group.
        </InputLabel>
        <TextInput
          type="text"
          placeholder={pageGroup.name}
          onChange={e => setPageGroupName(e.target.value)}
          value={pageGroupName}
          disabled={deletePageGroup.state === API_STATE.FETCHING}
        />
      </FormSection>
      <Button
        size="large"
        disabled={
          pageGroupName !== pageGroup.name ||
          deletePageGroup.state === API_STATE.FETCHING
        }
        onClick={() => deletePageGroup.exec()}
        warning
      >
        Delete {pageGroup.name} page group
      </Button>
    </>
  );
};

export default DeleteSection;

const Warning = styled.p`
  margin: 30px 0;
`;
