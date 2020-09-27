import styled from 'styled-components';

export const ModalHeader = styled.h2`
  text-align: center;
  font-weight: 400;
  margin: 0 0 10px 0;
`;

export const ModalSubHeader = styled.h3`
  text-align: center;
  font-weight: 400;
  font-size: 16px;
  margin: 0 0 30px 0;
`;

type ModalSectionProps = { sectionTitle: string };

export const ModalSection = styled.div<ModalSectionProps>`
  margin: 40px 0 0 0;

  :before {
    content: '${({ sectionTitle }) => sectionTitle}';
    display: block;
    font-weight: 400;
    font-size: 16px;
    padding-bottom: 10px;
    margin: 0 0 30px 0;
    border-bottom: 1px solid ${({ theme }) => theme.bg};
  }
`;
