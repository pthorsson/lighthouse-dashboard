import React from 'react';
import { Button } from '@ui/buttons';
import { TextInput, FormSection } from '@ui/inputs';
import { useApi, API_STATE, useObjectState } from '@hooks';

type UpdatePageGroupPayload = {
  namePrefix: string;
  name: string;
  nameSuffix: string;
};

type Props = {
  pageGroup: Lhd.PageGroup;
};

const PageGroupSettings: React.FC<Props> = ({ pageGroup }) => {
  const updatePageGroup = useApi(`/api/admin/page-group/${pageGroup._id}`, {
    method: 'PUT',
    delay: 300,
  });
  const [form, setForm] = useObjectState<UpdatePageGroupPayload>({
    namePrefix: pageGroup.namePrefix,
    name: pageGroup.name,
    nameSuffix: pageGroup.nameSuffix,
  });

  return (
    <>
      <FormSection marginBottom="20px">
        <TextInput
          type="text"
          placeholder="Name prefix"
          onChange={e => setForm({ namePrefix: e.target.value })}
          value={form.namePrefix}
          disabled={updatePageGroup.state === API_STATE.FETCHING}
        />
      </FormSection>

      <FormSection marginBottom="20px">
        <TextInput
          type="text"
          placeholder="Name"
          onChange={e => setForm({ name: e.target.value })}
          value={form.name}
          disabled={updatePageGroup.state === API_STATE.FETCHING}
        />
      </FormSection>

      <FormSection marginBottom="20px">
        <TextInput
          type="text"
          placeholder="Name suffix"
          onChange={e => setForm({ nameSuffix: e.target.value })}
          value={form.nameSuffix}
          disabled={updatePageGroup.state === API_STATE.FETCHING}
        />
      </FormSection>
      <Button
        size="large"
        disabled={
          (form.namePrefix === pageGroup.namePrefix &&
            form.name === pageGroup.name &&
            form.nameSuffix === pageGroup.nameSuffix) ||
          updatePageGroup.state === API_STATE.FETCHING
        }
        onClick={() => updatePageGroup.exec({ payload: form })}
      >
        Save
      </Button>
    </>
  );
};

export default PageGroupSettings;
