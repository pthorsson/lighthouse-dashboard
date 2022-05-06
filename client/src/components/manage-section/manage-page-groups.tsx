import React from 'react';
import styled from 'styled-components';
import { lighten } from 'polished';
import { Button } from '../../ui/buttons.js';
import { TextInput, InputLabel, FormSection } from '../../ui/inputs.js';
import Icon from '../../ui/icon.js';
import {
  useLighthouse,
  useApi,
  API_STATE,
  useObjectState,
} from '../../hooks/index.js';

type CreatePageGroupPayload = {
  namePrefix: string;
  name: string;
  nameSuffix: string;
  section: string;
};

type Props = {
  pageGroups: Lhd.PageGroup[];
  selectPageGroup: (pageGroup: string) => void;
};

const ManagePageGroups: React.FC<Props> = ({ pageGroups, selectPageGroup }) => {
  const { data: section } = useLighthouse();
  const createPageGroup = useApi(`/api/admin/page-group`, {
    method: 'POST',
    delay: 300,
  });
  const [form, setForm] = useObjectState<CreatePageGroupPayload>({
    namePrefix: '',
    name: '',
    nameSuffix: '',
    section: section._id,
  });

  let errorMessage = '';

  if (createPageGroup.error) {
    errorMessage =
      createPageGroup.error.message || `Error (${createPageGroup.error.type})`;
  }

  return (
    <>
      {pageGroups.map((pageGroup) => (
        <PageGroupWrapper
          key={pageGroup._id}
          onClick={() => selectPageGroup(pageGroup._id)}
        >
          <PageGroupName>
            {pageGroup.namePrefix && (
              <PageGroupNameDeco>
                {pageGroup.namePrefix}{' '}
                <Icon
                  type="chevron"
                  style={{ verticalAlign: 'text-top', height: 17, width: 10 }}
                />{' '}
              </PageGroupNameDeco>
            )}
            {pageGroup.name}
            <PageGroupNameDeco> {pageGroup.nameSuffix}</PageGroupNameDeco>
          </PageGroupName>
          <PageGroupEditLabel className="edit-icon-label">
            <Icon
              type="edit"
              style={{ verticalAlign: 'text-top', height: 16, width: 16 }}
            />
          </PageGroupEditLabel>
        </PageGroupWrapper>
      ))}
      <FormSection marginTop="20px" marginBottom="10px">
        <InputLabel>Add new page group</InputLabel>
        <NewPageGroupControls>
          <TextInput
            variant="small"
            type="text"
            placeholder="Prefix"
            onChange={(e) => setForm({ namePrefix: e.target.value })}
            value={form.namePrefix}
            disabled={createPageGroup.state === API_STATE.FETCHING}
          />
          <TextInput
            variant="small"
            type="text"
            placeholder="Name (required)"
            onChange={(e) => setForm({ name: e.target.value })}
            value={form.name}
            disabled={createPageGroup.state === API_STATE.FETCHING}
          />
          <TextInput
            variant="small"
            type="text"
            placeholder="Suffix"
            onChange={(e) => setForm({ nameSuffix: e.target.value })}
            value={form.nameSuffix}
            disabled={createPageGroup.state === API_STATE.FETCHING}
          />
          <Button
            adaptive={true}
            onClick={() => createPageGroup.exec({ payload: form })}
            disabled={
              !form.name || createPageGroup.state === API_STATE.FETCHING
            }
          >
            Add
          </Button>
        </NewPageGroupControls>
      </FormSection>
      {errorMessage}
    </>
  );
};

export default ManagePageGroups;

const PageGroupWrapper = styled.button`
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  color: ${({ theme }) => theme.fg};
  background: ${({ theme }) => theme.bg};
  margin-bottom: ${({ theme }) => theme.gridGap}px;
  padding: ${({ theme }) => `${theme.gridGap * 2}px ${theme.gridGap * 3}px`};
  height: 33px;
  border: 0;
  outline: 0;

  :hover {
    background: ${({ theme }) => lighten(0.07, theme.bg)};
    cursor: pointer;

    .edit-icon-label {
      opacity: 1;

      :before {
        opacity: 1;
        margin-right: 8px;
      }
    }
  }
`;

const PageGroupName = styled.div`
  font-size: 16px;
  overflow: hidden;
  white-space: nowrap;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1em;
`;

const PageGroupNameDeco = styled.span`
  display: inline;
  opacity: 0.6;
  font-weight: 400;
`;

const PageGroupEditLabel = styled.span`
  position: relative;
  display: inline;
  opacity: 0.6;
  font-weight: 400;

  :before {
    transition: margin-right 150ms, opacity 150ms;
    position: absolute;
    content: 'Page group settings';
    white-space: nowrap;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
  }
`;

const NewPageGroupControls = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr 100px 80px;
  grid-gap: 6px;
`;
