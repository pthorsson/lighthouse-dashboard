import React from 'react';
import styled, { keyframes } from 'styled-components';

type Props = {
  size?: number;
  strokeWidth?: number;
  duration?: number;
};

const Spinner: React.FC<Props> = ({
  size = 24,
  strokeWidth = 3,
  duration = 1.2,
}) => (
  <SpinnerWrapper
    _duration={duration}
    width={`${size - 2}px`}
    height={`${size - 2}px`}
    viewBox={`0 0 ${size} ${size}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <SpinnerPath
      _offset={size * 2.5}
      _duration={duration}
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      cx={size / 2}
      cy={size / 2}
      r={(size - 6) / 2}
    />
  </SpinnerWrapper>
);

export default Spinner;

type SpinnerWrapperProps = {
  _duration: number;
};

const SpinnerWrapper = styled.svg<SpinnerWrapperProps>`
  animation: ${() => keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(270deg); }
  `}
    ${({ _duration }) => _duration}s linear infinite;
`;

type SpinnerPathProps = {
  _offset: number;
  _duration: number;
};

const SpinnerPath = styled.circle<SpinnerPathProps>`
  stroke-dasharray: ${({ _offset }) => _offset};
  stroke-dashoffset: 0;
  transform-origin: center;
  stroke: ${({ theme }) => theme.fg};
  animation: ${({ _offset }) => keyframes`
    0% { stroke-dashoffset: ${_offset}; }
    50% {
      stroke-dashoffset: ${_offset / 4};
      transform: rotate(135deg);
    }
    100% {
      stroke-dashoffset: ${_offset};
      transform: rotate(450deg);
    }
  `}
    ${({ _duration }) => _duration}s ease-in-out infinite;
`;
