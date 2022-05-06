import React from 'react';
import styled, { css } from 'styled-components';
import Icon from '../../ui/icon.js';
import { PageGroupLayout } from './page-group.js';

type Props = {
  layout: PageGroupLayout;
  namePrefix?: string;
  name: string;
  nameSuffix: string;
};

const PageGroupHeader: React.FC<Props> = ({
  layout,
  name,
  namePrefix,
  nameSuffix,
}) => (
  <HeaderGrid layout={layout}>
    <GridCell>
      <PageGroupName>
        {namePrefix && (
          <PageGroupNameDeco>
            {namePrefix}{' '}
            <Icon
              type="chevron"
              style={{ verticalAlign: 'text-top', height: 22, width: 10 }}
            />{' '}
          </PageGroupNameDeco>
        )}
        {name}
        <PageGroupNameDeco> {nameSuffix}</PageGroupNameDeco>
      </PageGroupName>
    </GridCell>
    <GridCell>
      <ScoreHeader>Performance</ScoreHeader>
    </GridCell>
    <GridCell>
      <ScoreHeader>Accessibility</ScoreHeader>
    </GridCell>
    <GridCell>
      <ScoreHeader>Best practices</ScoreHeader>
    </GridCell>
    <GridCell>
      <ScoreHeader>SEO</ScoreHeader>
    </GridCell>
  </HeaderGrid>
);

export default PageGroupHeader;

// Elements

type GridCellProps = {
  alignItems?: 'center' | 'top' | 'bottom';
};

const GridCell = styled.div<GridCellProps>`
  display: flex;
  ${({ alignItems = 'center' }) => css`
    align-items: ${alignItems};
  `}
`;

type HeaderGridProps = {
  layout: PageGroupLayout;
};

const HeaderGrid = styled.div<HeaderGridProps>`
  display: grid;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1em;
  grid-gap: ${({ theme }) => theme.gridGap}px;
  padding: 0 40px;
  margin: 0 -40px;
  padding-top: ${({ theme }) => theme.gridGap * 4}px;
  padding-bottom: ${({ theme }) => theme.gridGap * 2}px;
  background: ${({ theme }) => theme.bgDark};
  z-index: 10;

  ${({ layout }) =>
    layout === 'display' &&
    css`
      position: sticky;
      top: 0;
    `}

  ${({ layout, theme }) => css`
    grid-template-columns: ${theme.gridLayout[layout]};
  `}
`;

const PageGroupName = styled.div`
  font-size: 20px;
  overflow: hidden;
  white-space: nowrap;
`;

const PageGroupNameDeco = styled.span`
  display: inline;
  opacity: 0.6;
  font-weight: 400;
`;

const ScoreHeader = styled.div`
  display: flex;
  align-items: flex-end;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
`;
