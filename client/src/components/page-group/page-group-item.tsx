import React, { useContext, memo } from 'react';
import styled, { css, ThemeContext } from 'styled-components';
import { lighten, darken } from 'polished';
import { timestampToDate } from '@lib/utils';
import { useLighthouse } from '@hooks';
import Spinner from '@ui/spinner';
import { perc, getLighthouseGradedColor } from './page-group.utils';
import { PageGroupLayout } from './page-group';
import PageGroupItemControls from './page-group-item-controls';

type Props = {
  layout: PageGroupLayout;
  id: string;
  url: string;
  audits: Lhd.Audit[];
};

const PageGroupItem: React.FC<Props> = memo(({ layout, url, id, audits }) => {
  const { state } = useLighthouse();
  const { active, queue } = state;

  const currentAudit = audits[0];
  const previousAudit = audits[1];

  const auditQueue = active ? [active, ...queue] : [];

  let date = '—';

  if (currentAudit?.timestamp) {
    const { day, month, time } = timestampToDate(currentAudit.timestamp);

    date = `${day}/${month} ${time}`;
  }

  const pageUrl = new URL(url);

  return (
    <AuditGrid layout={layout}>
      <AuditPageWrapper>
        <LoadingIndicator queuePosition={auditQueue.indexOf(id)} />
        <AuditPageUrl href={pageUrl.toString()} target="_blank">
          {pageUrl.pathname}
        </AuditPageUrl>
        <AuditPageTimestamp>{date}</AuditPageTimestamp>
      </AuditPageWrapper>
      <ScoreItem
        value={currentAudit?.performance}
        previousValue={previousAudit?.performance}
      />
      <ScoreItem
        value={currentAudit?.accessibility}
        previousValue={previousAudit?.accessibility}
      />
      <ScoreItem
        value={currentAudit?.bestPractices}
        previousValue={previousAudit?.bestPractices}
      />
      <ScoreItem value={currentAudit?.seo} previousValue={previousAudit?.seo} />
      {layout !== 'display' && (
        <PageGroupItemControls id={id} audits={audits} />
      )}
    </AuditGrid>
  );
});

export default PageGroupItem;

// Elements

type AuditGridProps = {
  layout: PageGroupLayout;
};

const rowHeight = 35;

const AuditGrid = styled.div<AuditGridProps>`
  display: grid;
  padding-top: ${({ theme }) => theme.gridGap}px;
  grid-gap: ${({ theme }) => theme.gridGap}px;
  height: ${rowHeight}px;

  :nth-child(2) {
    > :first-child {
      border-top-left-radius: 4px;
    }

    > :last-child > * {
      border-top-right-radius: 4px;
    }
  }

  :last-child {
    > :first-child {
      border-bottom-left-radius: 4px;
    }

    > :last-child > * {
      border-bottom-right-radius: 4px;
    }
  }

  ${({ layout, theme }) => css`
    grid-template-columns: ${theme.gridLayout[layout]};
  `}
`;

const AuditPageWrapper = styled.div`
  display: flex;
  position: relative;
  padding: 0 ${({ theme }) => theme.gridGap * 2}px;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.bg};
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 300;
  font-size: 16px;
  letter-spacing: 0.1em;
  line-height: 1em;
`;

const AuditPageUrl = styled.a`
  padding: 4px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const AuditPageTimestamp = styled.div`
  opacity: 0.5;
  line-height: 1em;
  padding-left: ${({ theme }) => theme.gridGap}px;
  white-space: nowrap;
`;

/**
 * Score item
 */

type ScoreItemProps = {
  value: number;
  previousValue?: number;
};

const ScoreItem: React.FC<ScoreItemProps> = memo(({ value, previousValue }) => {
  const theme = useContext(ThemeContext);

  return (
    <ScoreItemWrapper>
      <ScoreBarBackground value={value} />
      {value && (
        <ScoreBarFill value={value} previousValue={previousValue}>
          {theme.itemLayout === 'compared' && !!previousValue && (
            <ScoreBarDiff value={value} previousValue={previousValue} />
          )}
        </ScoreBarFill>
      )}
      <ScoreLabel value={value}>
        {typeof value === 'undefined'
          ? 'n/a'
          : value === null
          ? '?'
          : `${perc(value)}%`}
      </ScoreLabel>
    </ScoreItemWrapper>
  );
});

const ScoreItemWrapper = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  padding: 0 ${({ theme }) => theme.gridGap * 2}px;
  height: 100%;
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: normal;
  letter-spacing: 0.1em;
  line-height: 1em;
`;

type ScoreLabelProps = {
  value: number;
};

const ScoreLabel = styled.div<ScoreLabelProps>`
  position: relative;
  font-size: 14px;
  ${({ theme, value }) =>
    (theme.itemLayout === 'compared' || value === null) &&
    css`
      color: ${value === null
        ? getLighthouseGradedColor(theme.colorGradesDesaturated, 0.1)
        : value
        ? lighten(
            0.08,
            getLighthouseGradedColor(theme.colorGradesDesaturated, value)
          )
        : darken(0.5, theme.fg)};
    `}
`;

type ScoreBarBackgroundProps = {
  value: number;
};

const ScoreBarBackground = styled.div<ScoreBarBackgroundProps>`
  height: 100%;
  width: 100%;
  left: 0;
  position: absolute;
  opacity: 0.1;
  transition: background 300ms;
  ${({ theme, value }) =>
    theme.itemLayout === 'compared'
      ? css`
          background: ${theme.bg};
        `
      : css`
          background: ${value
            ? getLighthouseGradedColor(theme.colorGradesDesaturated, value)
            : theme.bg};
        `}
`;

type ScoreBarFillProps = {
  value: number;
  previousValue?: number;
};

const ScoreBarFill = styled.div<ScoreBarFillProps>`
  position: absolute;
  justify-content: center;
  height: 100%;
  left: 0;
  width: ${({ value }) => perc(value)}%;
  transition: width 500ms, background 300ms;
  min-width: 40px;
  ${({ theme, value, previousValue }) =>
    theme.itemLayout === 'compared'
      ? css`
          background: ${theme.bg};
        `
      : css`
          background: ${value
            ? getLighthouseGradedColor(theme.colorGradesDesaturated, value)
            : 'transparent'};
        `}
`;

type ScoreBarDiffProps = {
  value: number;
  previousValue?: number;
};

const ScoreBarDiff = styled.div<ScoreBarDiffProps>`
  position: absolute;
  width: ${({ value, previousValue }) =>
    perc(Math.abs(value - previousValue) / value)}%;
  height: 100%;
  ${({ theme, value, previousValue }) => {
    const color =
      value > previousValue
        ? theme.colorSuccessDesaturated
        : value < previousValue
        ? theme.colorErrorDesaturated
        : 'transparent';

    return css`
      background: repeating-linear-gradient(
        45deg,
        ${color},
        ${color} 4px,
        ${lighten(0.08, color)} 4px,
        ${lighten(0.08, color)} 8px
      );
    `;
  }};
  ${({ value, previousValue }) =>
    value > previousValue
      ? css`
          right: 0;
        `
      : css`
          left: 100%;
        `}
  :after {
    ${({ value, previousValue }) => {
      return Math.max(value, previousValue) > 0.75
        ? css`
            right: calc(100% + 7px);
          `
        : css`
            left: calc(100% + 7px);
          `;
    }};
    position: absolute;
    font-size: 12px;
    font-weight: 600;
    transform: translateY(-50%);
    top: 50%;
    transition: left 500ms, right 500ms, background 300ms, color 300ms;
    color: ${({ value, previousValue, theme }) =>
      value > previousValue
        ? lighten(0.08, theme.colorSuccessDesaturated)
        : value < previousValue
        ? lighten(0.08, theme.colorErrorDesaturated)
        : 'transparent'};
    content: '${({ value, previousValue }) => {
      const diff = value - previousValue;
      return diff > 0 ? `+${perc(diff)}` : diff < 0 ? `${perc(diff)}` : '';
    }}'
  }
`;

/**
 * Loading indicator spinner
 */

type LoadingIndicatorProps = {
  queuePosition?: number;
};

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  queuePosition = 0,
}) =>
  queuePosition > -1 ? (
    <LoadingIndicatorWrapper>
      {queuePosition === 0 ? (
        <Spinner size={28} />
      ) : (
        <QueueIndicator queuePosition={queuePosition}>
          <div>{queuePosition}</div>
        </QueueIndicator>
      )}
    </LoadingIndicatorWrapper>
  ) : null;

// Elements

const LoadingIndicatorWrapper = styled.div`
  position: absolute;
  right: calc(100% + 5px);
`;

type QueueIndicatorProps = {
  queuePosition: number;
};

const QueueIndicator = styled.div<QueueIndicatorProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  margin-right: 1.5px;
  border: 2.5px solid ${({ theme }) => theme.fg};
  border-radius: 100%;
  vertical-align: middle;
  text-align: center;
  letter-spacing: -0.01em;
  font-weight: 700;
  ${({ queuePosition }) =>
    queuePosition > 99
      ? css`
          font-size: 9px;
          line-height: 9px;
        `
      : css`
          padding-top: 0.5px;
          font-size: 11px;
          line-height: 11px;
        `}
`;
