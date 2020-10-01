import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

type Props = {
  header: string;
  message: string;
  link?: {
    href: string;
    text: string;
  };
};

const ErrorScreen: React.FC<Props> = ({ header, message, link }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Wrapper show={mounted}>
      <Header>{header}</Header>
      <Message>{message}</Message>
      {link && <Link href={link.href}>{link.text}</Link>}
    </Wrapper>
  );
};

export default ErrorScreen;

// Elements

type WrapperProps = {
  show: boolean;
};

const Wrapper = styled.div<WrapperProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  padding-bottom: 30vh;

  > * {
    transition: opacity 1000ms, transform 1000ms;
    transform: translateY(40px);
    opacity: 0;
  }

  ${({ show }) =>
    show &&
    css`
      > * {
        opacity: 1;
        transform: translateY(0px);
      }
    `}
`;

const Header = styled.h1`
  font-size: 56px;
  font-weight: 300;
  margin: 0 0 30px 0;
`;

const Message = styled.p`
  font-size: 26px;
  font-weight: 300;
  margin: 0 0 30px 0;
  transition-delay: 80ms;
`;

const Link = styled.a`
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition-delay: 160ms;

  :hover {
    text-decoration: none;
    color: rgba(255, 255, 255, 1);
  }
`;
