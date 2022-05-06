import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { Button } from '../../ui/buttons.js';
import { TextInput, InputLabel, FormSection } from '../../ui/inputs.js';
import { useApi, API_STATE } from '../../hooks/index.js';

type Props = {
  section: Lhd.Section;
};

const DeleteSection: React.FC<Props> = ({ section }) => {
  const [sectionSlug, setSectionSlug] = useState('');
  const history = useHistory();
  const deleteSection = useApi(`/api/admin/section/${section._id}`, {
    method: 'DELETE',
    delay: 300,
  });

  useEffect(() => {
    if (deleteSection.state === API_STATE.SUCCESS) {
      history.push('/', {
        message: `Section "${section.name}" has been deleted`,
      });
    }
  }, [deleteSection.state]);

  return (
    <>
      <Warning>
        WARNING! When deleting a section you will also delete everything under
        it. That includes page groups, pages, audits and reports.
      </Warning>
      <FormSection marginBottom="20px">
        <InputLabel>Enter the slug ({section.slug}) of the section.</InputLabel>
        <TextInput
          type="text"
          placeholder={section.slug}
          onChange={(e) => setSectionSlug(e.target.value)}
          value={sectionSlug}
          disabled={deleteSection.state === API_STATE.FETCHING}
        />
      </FormSection>
      <Button
        size="large"
        disabled={
          sectionSlug !== section.slug ||
          deleteSection.state === API_STATE.FETCHING
        }
        onClick={() => deleteSection.exec()}
        warning
      >
        Delete {section.name} section
      </Button>
    </>
  );
};

export default DeleteSection;

const Warning = styled.p`
  margin: 30px 0;
`;
