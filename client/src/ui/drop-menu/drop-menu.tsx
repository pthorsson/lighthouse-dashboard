import React, { useCallback } from 'react';
import { lighten } from 'polished';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useDropMenu, useDropMenus } from '@ui/drop-menu';
import { Transition } from 'react-transition-group';

type Props = {
  id: string;
  posY?: 'top' | 'bottom';
  posX?: 'left' | 'right';
};

type TransitionStatus = 'entering' | 'entered' | 'exiting' | 'exited';

const DropMenu: React.FC<Props> = ({
  children,
  id,
  posY = 'bottom',
  posX = 'left',
}) => {
  const { isOpen } = useDropMenu(id);

  return (
    <Transition
      in={isOpen}
      duration={150}
      timeout={{ enter: 0, exit: 150 }}
      unmountOnExit
    >
      {(state: TransitionStatus) => (
        <Wrapper id={`drop-menu__${id}`} state={state} posY={posY} posX={posX}>
          {children}
        </Wrapper>
      )}
    </Transition>
  );
};

export default DropMenu;

// Elements

type WrapperProps = {
  state: TransitionStatus;
  posY: Props['posY'];
  posX: Props['posX'];
};

const stateStyle: any = {
  opacity: {
    entering: 0,
    entered: 1,
    exiting: 0,
    exited: 0,
  },
  transform: {
    entering: 'scale3d(0.97, 0.97, 0.97)',
    entered: 'scale3d(1, 1, 1)',
    exiting: 'scale3d(0.97, 0.97, 0.97)',
    exited: 'scale3d(0.97, 0.97, 0.97)',
  },
};

const Wrapper = styled.div<WrapperProps>`
  position: absolute;
  background: ${({ theme }) => theme.bg};
  min-width: 200px;
  z-index: 1000;
  padding: 10px 0;
  border-radius: 4px;
  box-shadow: 0 3px 10px 1px rgba(0, 0, 0, 0.4);
  transition: opacity 150ms, transform 150ms;
  transform-origin: top right;
  opacity: ${({ state }) => stateStyle.opacity[state]};
  transform: ${({ state }) => stateStyle.transform[state]};

  ${({ posY, theme }) =>
    posY === 'bottom'
      ? css`
          top: calc(100% + ${theme.gridGap}px);
        `
      : css`
          bottom: calc(100% + ${theme.gridGap}px);
        `}

  ${({ posX }) =>
    posX === 'left'
      ? css`
          left: 0;
        `
      : css`
          right: 0;
        `}
`;

// Exported sub modules

export const DropDownTitle = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 30px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 11px;
  letter-spacing: 0.05em;
  opacity: 0.6;
`;

export const DropDownDivider = styled.div`
  border-bottom: 1px solid ${({ theme }) => lighten(0.07, theme.bg)};
  margin: 10px 0;
`;

type DropDownItemProps = {
  type: 'button' | 'route' | 'link';
  closeOnClick?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  to?: string;
  href?: string;
  target?: string;
};

export const DropDownItem: React.FC<DropDownItemProps> = ({
  children,
  onClick = () => {},
  type,
  closeOnClick = true,
  to,
  href,
  target,
}) => {
  const { close } = useDropMenus();

  const clickHandler = useCallback(event => {
    onClick(event);
    closeOnClick && close();
  }, []);

  if (type === 'button') {
    return (
      <DropDownButtonItemElement onClick={clickHandler}>
        {children}
      </DropDownButtonItemElement>
    );
  }

  if (type === 'link') {
    return (
      <DropDownLinkItemElement
        href={href}
        target={target}
        onClick={clickHandler}
      >
        {children}
      </DropDownLinkItemElement>
    );
  }

  if (type === 'route') {
    return (
      <DropDownInternalLinkItemElement to={to} onClick={clickHandler}>
        {children}
      </DropDownInternalLinkItemElement>
    );
  }
};

const dropDownItemBase = css`
  display: flex;
  align-items: center;
  position: relative;
  padding: 0px 20px;
  height: 30px;
  min-width: 100%;
  text-decoration: none;
  transition: background 100ms;
  font-size: 14px;
  color: ${({ theme }) => theme.fg};
  border: 0;
  outline: 0;
  background: ${({ theme }) => theme.bg};

  :hover {
    text-decoration: none;
    background: ${({ theme }) => lighten(0.07, theme.bg)};
    cursor: pointer;
  }
`;

const DropDownButtonItemElement = styled.button`
  ${dropDownItemBase};
`;

const DropDownLinkItemElement = styled.a`
  ${dropDownItemBase};
`;

const DropDownInternalLinkItemElement = styled(Link)`
  ${dropDownItemBase};
`;
