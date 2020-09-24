import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { timestampToDate } from '@lib/utils';
import {
  useDropMenu,
  useLighthouse,
  EnsureUserRole,
  USER_ROLES,
  useApi,
} from '@hooks';
import Icon from '@ui/icon';
import { Button, LinkButton } from '@ui/buttons';

type Props = {
  id: string;
  audits: Lhd.Audit[];
};

const PageGroupItemControls: React.FC<Props> = ({ id, audits }) => {
  const { isOpen, toggle } = useDropMenu(id);
  const { state, section } = useLighthouse();
  const removeQueuedAudit = useApi(
    `/api/actions/remove-queued-audit/${section}/${id}`
  );
  const triggerAudit = useApi(`/api/actions/trigger-audit/${section}/${id}`);

  return useMemo(
    () => (
      <>
        <EnsureUserRole role={USER_ROLES.USER}>
          {state.queue.indexOf(id) > -1 ? (
            <Button
              tooltip="Remove from queue"
              adaptive={true}
              noPadding={true}
              onClick={() => removeQueuedAudit.exec()}
            >
              <Icon type="cross" style={{ width: 18 }} />
            </Button>
          ) : (
            <Button
              tooltip="Trigger audit"
              adaptive={true}
              noPadding={true}
              disabled={state.active === id}
              onClick={() => triggerAudit.exec()}
            >
              <Icon type="refresh" />
            </Button>
          )}
        </EnsureUserRole>
        <LinkButton
          adaptive={true}
          noPadding={true}
          disabled={!audits[0]}
          {...(audits[0] && {
            href: `/report/${audits[0]._id}`,
            target: '_blank',
          })}
        >
          View report
        </LinkButton>
        <Button
          adaptive={true}
          noPadding={true}
          onClick={() => toggle()}
          disabled={audits.length < 1}
        >
          <Icon
            type="chevron"
            style={{
              transform: `rotate(${isOpen ? -90 : 90}deg)`,
              transition: 'transform 150ms',
            }}
          />
          <ReportsMenu isOpen={isOpen}>
            {audits.map(audit => (
              <ReportLink
                key={audit.timestamp}
                href={`/report/${audit._id}`}
                target="_blank"
              >
                {formatTimestamp(audit.timestamp)}
              </ReportLink>
            ))}
          </ReportsMenu>
        </Button>
      </>
    ),
    [isOpen, state]
  );
};

export default PageGroupItemControls;

/**
 * Helper function for formatting a unis timestamp into readable format.
 */
const formatTimestamp = (timestamp: number) => {
  const { day, month, year, time } = timestampToDate(timestamp);

  return `${day}/${month} ${year}, ${time}`;
};

type AuditsMenuProps = {
  isOpen: boolean;
};

const ReportsMenu = styled.div<AuditsMenuProps>`
  position: absolute;
  right: 5px;
  top: calc(100% - 5px);
  transition: opacity 150ms, transform 150ms;
  width: 180px;
  z-index: 100;
  background: ${({ theme }) => theme.bg};
  box-shadow: 0 3px 10px 1px rgba(0, 0, 0, 0.9);
  padding: 4px 0;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0;
  transform: scale3d(0.97, 0.97, 0.97);
  transform-origin: top right;

  ${({ isOpen }) =>
    isOpen &&
    css`
      opacity: 1;
      transform: scale3d(1, 1, 1);
      pointer-events: initial;
    `}
`;

const ReportLink = styled.a`
  display: block;
  position: relative;
  text-align: left;
  font-size: 14px;
  padding: 8px 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    text-decoration: none;
  }

  :first-child:after {
    content: 'latest';
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    display: inline-block;
    margin-left: 5px;
    padding: 3px 5px;
    border-radius: 3px;
    font-size: 11px;
    line-height: 10px;
    background: ${({ theme }) => theme.bgDark};
  }
`;
