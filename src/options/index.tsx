import React from 'react';
import ReactDOM from 'react-dom/client';
import OptionsApp from './App';
import { I18nProvider } from '../i18n';

const root = document.createElement("div");
document.body.appendChild(root);
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <I18nProvider>
      <OptionsApp />
    </I18nProvider>
  </React.StrictMode>
);


