import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from '../i18n';
import { injectCurrentTabOnPopupOpen } from '../utils/hasHostPermission';

injectCurrentTabOnPopupOpen();

const root = document.createElement("div")
document.body.appendChild(root)
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
      <I18nProvider>
          <App />
      </I18nProvider>
  </React.StrictMode>
);
