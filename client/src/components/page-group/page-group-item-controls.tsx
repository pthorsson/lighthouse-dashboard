import React, { useMemo } from 'react';
import styled from 'styled-components';
import { timestampToDate } from '../../lib/utils.js';
import {
  useLighthouse,
  EnsureUserRole,
  USER_ROLES,
  useApi,
  useAppState,
  SERVER_STATE,
} from '../../hooks/index.js';
import DropMenu, {
  DropDownItem,
  DropDownTitle,
  useDropMenu,
} from '../../ui/drop-menu/index.js';
import Icon from '../../ui/icon.js';

import { Button, LinkButton } from '../../ui/buttons.js';

type Props = {
  id: string;
  audits: Lhd.Audit[];
};

const PageGroupItemControls: React.FC<Props> = ({ id, audits }) => {
  const { isOpen, toggle } = useDropMenu(`report-links_${id}`);
  const { state, section } = useLighthouse();
  const { serverState } = useAppState();
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
              disabled={serverState !== SERVER_STATE.OK}
            >
              <Icon type="cross" />
            </Button>
          ) : (
            <Button
              tooltip="Trigger audit"
              adaptive={true}
              noPadding={true}
              disabled={state.active === id || serverState !== SERVER_STATE.OK}
              onClick={() => triggerAudit.exec()}
            >
              <Icon type="play" />
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
        <DropDownWrapper>
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
          </Button>
          <DropMenu id={`report-links_${id}`} posX="right">
            <DropDownTitle>Reports</DropDownTitle>
            {audits.map((audit, i) => (
              <DropDownItem
                type="link"
                key={audit.timestamp}
                href={`/report/${audit._id}`}
                target="_blank"
              >
                {formatTimestamp(audit.timestamp)}
                {i === 0 && <LatestLabel />}
              </DropDownItem>
            ))}
          </DropMenu>
        </DropDownWrapper>
      </>
    ),
    [isOpen, state, serverState]
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

const LatestLabel = styled.span`
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

  :after {
    content: 'latest';
  }
`;

const DropDownWrapper = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: relative;

  > button {
    flex: 1 1 auto;
  }
`;
