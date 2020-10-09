import styled, { css } from 'styled-components';
import { lighten, darken } from 'polished';
import { Link } from 'react-router-dom';

const buttonStyle = css`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 0;
  outline: 0;
  font-size: 11px;
  line-height: 1em;
  font-weight: 500;
  letter-spacing: 0;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.fg};
  white-space: nowrap;
  font-family: 'Roboto';
  transition: background 100ms;

  :hover {
    text-decoration: none;
    background: ${({ theme }) => lighten(0.07, theme.bg)};
    cursor: pointer;
  }
`;

const tooltipCSS = (message: string) =>
  message &&
  css`
    :before,
    :after {
      pointer-events: none;
      position: absolute;
      opacity: 0;
      transition: margin-bottom 150ms, opacity 150ms;
    }

    :after {
      display: block;
      padding: 4px 6px;
      background: black;
      border-radius: 4px;
      content: "${message}";
      bottom: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
    }

    :before {
      content: '';
      bottom: 100%;
      width: 0; 
      height: 0; 
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid black;
    }

    :hover:before,
    :hover:after {
      margin-bottom: 2px;
      opacity: 1;
    }
  `;

type ButtonProps = {
  size?: 'normal' | 'large';
  noPadding?: boolean;
  adaptive?: boolean;
  tooltip?: string;
  warning?: boolean;
  square?: boolean;
};

export const Button = styled.button<ButtonProps>`
  ${buttonStyle}

  padding: ${({ noPadding }) => (noPadding ? '0' : '0 10px')};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}

  ${({ size }) =>
    size === 'large' &&
    css`
      font-size: 16px;
      font-weight: 300;
      padding: 0 14px;
      border-radius: 4px;
    `}

    ${({ warning }) =>
      warning &&
      css`
        background: ${({ theme }) => theme.colorError};

        :hover {
          background: ${({ theme }) => darken(0.1, theme.colorError)};
        }
      `}

    ${({ size, adaptive }) =>
      !adaptive
        ? css`
            height: ${size === 'large' ? 36 : 24}px;
          `
        : css`
            height: auto;
          `}

    ${({ size, square }) =>
      square &&
      css`
        width: ${size === 'large' ? 36 : 24}px;
        padding: 0;
      `};


  ${({ tooltip }) => tooltip && tooltipCSS(tooltip)}
`;

type LinkButtonProps = {
  disabled?: boolean;
  tooltip?: string;
};

export const LinkButton = styled.a<ButtonProps & LinkButtonProps>`
  ${buttonStyle}

  padding: ${({ noPadding }) => (noPadding ? '0' : '0 10px')};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}

  ${({ size }) =>
    size === 'large' &&
    css`
      font-size: 16px;
      font-weight: 300;
      padding: 0 14px;
      border-radius: 4px;
    `}

  ${({ size, adaptive, square }) =>
    !adaptive
      ? css`
          height: ${size === 'large' ? 36 : 24}px;
        `
      : css`
          height: auto;
          padding: 0;
        `}
    
  ${({ tooltip }) => tooltip && tooltipCSS(tooltip)}
`;

export const RouteLinkButton = styled(Link)<ButtonProps & LinkButtonProps>`
  ${buttonStyle}

  padding: ${({ noPadding }) => (noPadding ? '0' : '0 10px')};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}

  ${({ size }) =>
    size === 'large' &&
    css`
      font-size: 16px;
      font-weight: 300;
      padding: 0 14px;
      border-radius: 4px;
    `}

  ${({ size, adaptive }) =>
    !adaptive
      ? css`
          height: ${size === 'large' ? 36 : 24}px;
        `
      : css`
          height: auto;
          padding: 0;
        `}
    
  ${({ tooltip }) => tooltip && tooltipCSS(tooltip)}
`;
