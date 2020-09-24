import { DefaultTheme } from 'styled-components';
import { desaturate } from 'polished';

const base = {
  fg: '#f5f5f5',
  bg: '#484848',
  bgDark: '#212121',
  gridGap: 4,
  gridLayout: {
    display: 'minmax(0, 2fr) repeat(4, minmax(0, 1fr))',
    viewer: 'minmax(0, 2fr) repeat(4, minmax(0, 1fr)) 70px 20px',
    user: 'minmax(0, 2fr) repeat(4, minmax(0, 1fr)) 35px 70px 20px',
  },
  itemLayout: 'standard',
};

const colorSuccess = '#0cce6b';
const colorWarning = '#ffa400';
const colorError = '#ff4e42';

const DESATURATION_VALUE = 0.3;

const colorSuccessDesaturated = desaturate(DESATURATION_VALUE, '#0cce6b');
const colorWarningDesaturated = desaturate(DESATURATION_VALUE, '#ffa400');
const colorErrorDesaturated = desaturate(DESATURATION_VALUE, '#ff4e42');

export const defaultTheme: DefaultTheme = {
  ...base,
  colorSuccess,
  colorWarning,
  colorError,
  colorGrades: [colorSuccess, colorWarning, colorError],
  colorSuccessDesaturated,
  colorWarningDesaturated,
  colorErrorDesaturated,
  colorGradesDesaturated: [
    colorSuccessDesaturated,
    colorWarningDesaturated,
    colorErrorDesaturated,
  ],
};
