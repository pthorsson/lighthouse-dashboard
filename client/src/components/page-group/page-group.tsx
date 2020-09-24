import React from 'react';
import styled from 'styled-components';
import { useCurrentUser, USER_ROLES } from '@hooks';
import PageGroupHeader from './page-group-header';
import PageGroupItem from './page-group-item';

export type PageGroupLayout = 'user' | 'viewer' | 'display';

type Props = {
  mode: 'dashboard' | 'display';
  pageGroup: Lhd.PageGroup;
};

const PageGroup: React.FC<Props> = ({ mode = 'display', pageGroup }) => {
  const { ensureRole } = useCurrentUser();
  const layout: PageGroupLayout =
    mode === 'display'
      ? 'display'
      : ensureRole(USER_ROLES.USER)
      ? 'user'
      : 'viewer';

  return pageGroup.pages.length ? (
    <Wrapper>
      <PageGroupHeader
        layout={layout}
        namePrefix={pageGroup.namePrefix}
        name={pageGroup.name}
        nameSuffix={pageGroup.nameSuffix}
      />
      {pageGroup.pages.map(({ _id, url, audits }, i) => (
        <PageGroupItem
          key={_id}
          layout={layout}
          id={_id}
          url={url}
          audits={audits}
        />
      ))}
    </Wrapper>
  ) : null;
};

export default PageGroup;

// Elements

const Wrapper = styled.div`
  padding: 0 40px;
`;
