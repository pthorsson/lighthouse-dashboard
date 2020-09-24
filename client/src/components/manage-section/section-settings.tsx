import React from 'react';
import { Button } from '@ui/buttons';
import { TextInput, FormSection } from '@ui/inputs';
import { useApi, API_STATE, useObjectState } from '@hooks';

type Props = {
  section: Lhd.Section;
};

const SectionSettings: React.FC<Props> = ({ section }) => {
  const updateSection = useApi(`/api/admin/section/${section._id}`, {
    method: 'PUT',
    delay: 300,
  });
  const [form, setForm] = useObjectState<{ name: string }>({
    name: section.name,
  });

  return (
    <>
      <FormSection marginBottom="20px">
        <TextInput
          type="text"
          placeholder="Section name"
          onChange={e => setForm({ name: e.target.value })}
          value={form.name}
          disabled={updateSection.state === API_STATE.FETCHING}
        />
      </FormSection>
      <Button
        size="large"
        disabled={
          form.name === section.name ||
          updateSection.state === API_STATE.FETCHING
        }
        onClick={() => updateSection.exec({ payload: form })}
      >
        Save
      </Button>
    </>
  );
};

export default SectionSettings;
