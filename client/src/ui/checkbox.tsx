import React from 'react';
import styled from 'styled-components';

type Props = {
  checked?: boolean;
  onChange?: (event: any) => void;
  reverse?: boolean;
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
};

const Checkbox: React.FC<Props> = ({
  children,
  checked,
  onChange,
  reverse = false,
  justifyContent = 'flex-start',
}) => {
  return (
    <CheckboxLabel reverse={reverse} justifyContent={justifyContent}>
      <CheckboxInput type="checkbox" checked={checked} onChange={onChange} />
      <CheckboxMark reverse={reverse}>
        <CheckIcon />
      </CheckboxMark>
      {children}
    </CheckboxLabel>
  );
};

export default Checkbox;

type CheckboxLabelProps = {
  reverse: Props['reverse'];
  justifyContent: Props['justifyContent'];
};

const CheckboxLabel = styled.label<CheckboxLabelProps>`
  cursor: pointer;
  display: flex;
  line-height: 1em;
  justify-content: ${({ justifyContent }) => justifyContent};

  flex-direction: ${({ reverse }) => (reverse ? 'row-reverse' : 'row')};
`;

const CheckboxInput = styled.input`
  display: none;

  :checked + span {
    background: ${({ theme }) => theme.fg};

    svg {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

type CheckboxMarkProps = {
  reverse: Props['reverse'];
};

const CheckboxMark = styled.span<CheckboxMarkProps>`
  cursor: pointer;
  position: relative;
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.fg};
  margin: ${({ reverse }) => (reverse ? '0 0 0 6px' : '0 6px 0 0')};
  color: ${({ theme }) => theme.bg};
  transition: background 150ms;

  > svg {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    margin: -1px 0 0 -1px;
    transform: scale(0.1);
    opacity: 0;
    transition: transform 150ms, opacity 150ms;
  }
`;

const CheckIcon: React.FC = () => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path d="M4 7.42l2.79 2.79L12 5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
