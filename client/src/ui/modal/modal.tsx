import React from 'react';
import styled, { css } from 'styled-components';
import { useModal } from './modal-provider.js';
import Icon from '../icon.js';

type Props = {
  id: string;
  backButton?: boolean;
};

const Modal: React.FC<Props> = ({ children, id, backButton }) => {
  const { isOpen, toggle, back } = useModal(id);

  return isOpen ? (
    <Wrapper>
      <InnerWrapper>
        <ContentWrapper>
          <Backgdrop onClick={() => toggle(false)} />
          <ModalWrapper>
            {backButton && (
              <ModalBackButton onClick={() => back()}>
                <Icon type="arrow-back" /> Back
              </ModalBackButton>
            )}
            <ModalCloseButton onClick={() => toggle(false)}>
              <Icon type="cross" />
            </ModalCloseButton>
            {children}
          </ModalWrapper>
        </ContentWrapper>
      </InnerWrapper>
    </Wrapper>
  ) : null;
};

export default Modal;

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
`;

const Backgdrop = styled.div`
  display: block;
  background: rgba(0, 0, 0, 0.7);
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 1005;
`;

const InnerWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const ContentWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 50px;
`;

const ModalWrapper = styled.div`
  position: relative;
  z-index: 1010;
  max-width: 700px;
  flex: 1 1 100%;
  box-shadow: 0 0px 25px 10px rgba(0, 0, 0, 0.4);
  padding: 50px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bgDark};
`;

const modalButtonCSS = css`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  margin: 0;
  outline: 0;
  top: 10px;
  height: 33px;
  border-radius: 4px;
  transition: background 150ms;
  background: transparent;
  cursor: pointer;
`;

const ModalCloseButton = styled.button`
  ${modalButtonCSS};
  right: 10px;
  width: 33px;
  color: ${({ theme }) => theme.fg};

  :hover {
    background: ${({ theme }) => theme.bg};
  }
`;

const ModalBackButton = styled.button`
  ${modalButtonCSS};
  left: 10px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.fg};

  :hover {
    background: ${({ theme }) => theme.bg};
  }
`;
