import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useObjectState, useApi, API_STATE } from '@hooks';
import Modal, { useModal } from '@ui/modal';
import { Button } from '@ui/buttons';
import { TextInput, InputLabel, FormSection } from '@ui/inputs';
import kebabCase from 'lodash/kebabCase';

type Props = {
  onComplete: () => void;
};

type CreateSectionPayload = {
  name: string;
  slug: string;
};

const CreateSection: React.FC<Props> = ({ onComplete = () => {} }) => {
  const { isOpen, toggle: toggleModal } = useModal('create-section-modal');
  const sectionNameInput = useRef<HTMLInputElement>();
  const createSection = useApi('/api/admin/section', {
    method: 'POST',
    delay: 300,
  });

  const [form, setForm] = useObjectState<CreateSectionPayload>({
    name: '',
    slug: '',
  });

  // Auto focus first input
  useEffect(() => {
    isOpen && sectionNameInput?.current?.focus();
  }, [isOpen]);

  // Reset state on modal close
  useEffect(() => {
    if (!isOpen) {
      setForm({ name: '', slug: '' });
    }
  }, [isOpen]);

  // Set kebab cased slug when updating section name
  useEffect(() => {
    setForm({ slug: kebabCase(form.name) });
  }, [form.name]);

  // Closes modal and fire onComplete callback when api state is success
  useEffect(() => {
    if (createSection.state === API_STATE.SUCCESS) {
      toggleModal(false);
      onComplete();
    }
  }, [createSection.state]);

  let errorMessage = null;

  if (createSection.error) {
    if (createSection.error.type === 'required') {
      errorMessage = 'Both section name and section slug are required';
    } else if (createSection.error.type === 'not_unique') {
      errorMessage = 'Section slug does already exist';
    } else {
      errorMessage =
        createSection.error.message || `Error (${createSection.error.type})`;
    }
  }

  return (
    <Modal id="create-section-modal">
      <ModalHeader>Add new section</ModalHeader>
      <FormSection>
        <InputLabel htmlFor="section-name">Section name</InputLabel>
        <TextInput
          id="section-name"
          type="text"
          value={form.name}
          onChange={e => setForm({ name: e.target.value })}
          placeholder="My awesome section"
          disabled={createSection.state === API_STATE.FETCHING}
          ref={sectionNameInput}
        />
      </FormSection>
      <FormSection>
        <InputLabel htmlFor="section-slug">Section slug</InputLabel>
        <TextInput
          id="section-slug"
          type="text"
          value={form.slug}
          onChange={e => setForm({ slug: e.target.value })}
          placeholder="my-awesome-section"
          disabled={createSection.state === API_STATE.FETCHING}
        />
      </FormSection>
      {errorMessage && <FormSection align="center">{errorMessage}</FormSection>}
      <FormSection align="center" marginTop="50px">
        <Button
          size="large"
          onClick={() => createSection.exec({ payload: form })}
          disabled={createSection.state === API_STATE.FETCHING}
        >
          Create section
        </Button>
      </FormSection>
    </Modal>
  );
};

export default CreateSection;

// Elements

const ModalHeader = styled.h2`
  text-align: center;
  font-weight: 400;
  margin: 0 0 30px 0;
`;
