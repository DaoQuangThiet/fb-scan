import {
  SettingsProvider,
  KikiThemeProvider,
  ModalProvider,
  GlobalStyles,
} from '@kikisoftware/uikit';
import React from 'react';

const Layout = ({ children }) => {
  return (
    <SettingsProvider>
      <KikiThemeProvider>
        <ModalProvider>
          <GlobalStyles />
          {children}
        </ModalProvider>
      </KikiThemeProvider>
    </SettingsProvider>
  );
};

export default Layout;
