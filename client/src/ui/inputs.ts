import styled, { css } from 'styled-components';
import { lighten } from 'polished';

export const InputLabel = styled.label`
  display: block;
  font-size: 18px;
  margin-bottom: 10px;
`;

type TextInputProps = {
  variant?: 'small';
};

export const TextInput = styled.input<TextInputProps>`
  display: block;
  width: 100%;
  font-size: 18px;
  min-width: 0;
  border: 0;
  max-width: 100%;
  border-radius: 2px;
  padding: 10px 15px;
  color: ${({ theme }) => theme.bg};

  ::placeholder {
    color: ${({ theme }) => lighten(0.3, theme.bg)};
  }

  :focus {
    outline: 0;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
  }

  ${({ variant }) =>
    variant === 'small' &&
    css`
      padding: 5px 10px;
      font-size: 14px;
    `}
`;

type FormSectionType = {
  align?: 'flex-start' | 'center' | 'flex-right' | 'stretch';
  marginTop?: string;
  marginBottom?: string;
};

export const FormSection = styled.div<FormSectionType>`
  display: flex;
  flex-direction: column;
  align-items: ${({ align }) => align || 'flex-start'};
  margin-top: ${({ marginTop }) => marginTop || 0};
  margin-bottom: ${({ marginBottom }) => marginBottom || '20px'};
`;
