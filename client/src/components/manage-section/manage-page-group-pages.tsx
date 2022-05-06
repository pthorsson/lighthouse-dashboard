import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../ui/buttons.js';
import { TextInput, InputLabel, FormSection } from '../../ui/inputs.js';
import Icon from '../../ui/icon.js';
import { useApi, API_STATE, useObjectState } from '../../hooks/index.js';

type CreatePagePayload = {
  url: string;
  pageGroup: string;
};

type Props = {
  pageGroup: Lhd.PageGroup;
};

const ManagePageGroupPages: React.FC<Props> = ({ pageGroup }) => {
  const [confirmedPageId, setConfirmedPageId] = useState(null);
  const createPage = useApi('/api/admin/page', {
    method: 'POST',
    delay: 300,
  });
  const deletePage = useApi('/api/admin/page/:pageId', {
    method: 'DELETE',
    delay: 300,
  });
  const [form, setForm] = useObjectState<CreatePagePayload>({
    url: '',
    pageGroup: pageGroup._id,
  });

  let createErrorMessage;

  if (createPage.error) {
    createErrorMessage =
      createPage.error.message || `Error (${createPage.error.type})`;
  }

  return (
    <>
      {pageGroup.pages.map((page) => (
        <PageWrapper key={page._id}>
          <PageUrl>{page.url}</PageUrl>
          {confirmedPageId === page._id ? (
            <>
              <Button
                adaptive
                warning
                style={{ marginRight: 4 }}
                disabled={deletePage.state === API_STATE.FETCHING}
                onClick={() => {
                  deletePage.exec({ params: { pageId: confirmedPageId } });
                }}
              >
                Yes, delete this
                <Icon
                  type="trash"
                  style={{
                    verticalAlign: 'text-top',
                    height: 16,
                    width: 16,
                    marginLeft: 5,
                  }}
                />
              </Button>
              <Button
                adaptive
                disabled={deletePage.state === API_STATE.FETCHING}
                onClick={() => {
                  setConfirmedPageId(null);
                }}
              >
                <Icon
                  type="cross"
                  style={{ verticalAlign: 'text-top', height: 16, width: 16 }}
                />
              </Button>
            </>
          ) : (
            <Button
              adaptive
              disabled={deletePage.state === API_STATE.FETCHING}
              onClick={() => {
                setConfirmedPageId(page._id);
              }}
            >
              <Icon
                type="trash"
                style={{ verticalAlign: 'text-top', height: 16, width: 16 }}
              />
            </Button>
          )}
        </PageWrapper>
      ))}
      <FormSection marginTop="20px" marginBottom="10px">
        <InputLabel>Add new page</InputLabel>
        <NewPageControls>
          <TextInput
            variant="small"
            type="text"
            placeholder="Example: https://www.google.com/"
            onChange={(e) => setForm({ url: e.target.value })}
            value={form.url}
            disabled={createPage.state === API_STATE.FETCHING}
          />
          <Button
            adaptive={true}
            onClick={() => createPage.exec({ payload: form })}
            disabled={!form.url || createPage.state === API_STATE.FETCHING}
          >
            Add
          </Button>
        </NewPageControls>
      </FormSection>
      {createErrorMessage}
    </>
  );
};

export default ManagePageGroupPages;

const PageWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  color: ${({ theme }) => theme.fg};
  margin-bottom: ${({ theme }) => theme.gridGap}px;
  border: 0;
  outline: 0;
`;

const PageUrl = styled.div`
  padding: ${({ theme }) => `${theme.gridGap * 2}px ${theme.gridGap * 3}px`};
  background: ${({ theme }) => theme.bg};
  flex: 1 1 auto;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  margin-right: ${({ theme }) => theme.gridGap}px;
  line-height: 1em;
`;

const NewPageControls = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 80px;
  grid-gap: 6px;
`;
