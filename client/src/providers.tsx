import React from 'react';
import { ThemeProvider } from 'styled-components';
import { ModalProvider } from '@ui/modal';
import { DropMenuProvider } from '@ui/drop-menu';
import { CurrentUserProvider, AppStateProvider } from '@hooks';
import { defaultTheme } from './theme';

const Providers: React.FC = ({ children }) => (
  <CurrentUserProvider>
    <AppStateProvider>
      <ThemeProvider theme={defaultTheme}>
        <DropMenuProvider>
          <ModalProvider>{children}</ModalProvider>
        </DropMenuProvider>
      </ThemeProvider>
    </AppStateProvider>
  </CurrentUserProvider>
);

export default Providers;
