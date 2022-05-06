import React from 'react';
import { ThemeProvider } from 'styled-components';
import { ModalProvider } from './ui/modal/index.js';
import { DropMenuProvider } from './ui/drop-menu/index.js';
import { CurrentUserProvider, AppStateProvider } from './hooks/index.js';
import { defaultTheme } from './theme.js';

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
