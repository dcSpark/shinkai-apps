import '../theme/styles.css';
import './popup.css';

import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux'
import { MemoryRouter as Router } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react'

import { PopupRouting } from '../components/popup-routing/popup-routing';
import { langMessages, locale } from '../lang/intl';
import { store, storePersistor } from '../store';
import { antdTheme } from '../theme/antd-theme';

const container = document.getElementById('root');
if (!container) {
  throw new Error('root container not found');
}
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
    <PersistGate loading={null} persistor={storePersistor}>
      <StyleProvider hashPriority="high">
        <IntlProvider locale={locale} messages={langMessages}>
          <ConfigProvider theme={antdTheme}>
            <Router>
              <PopupRouting></PopupRouting>
            </Router>
          </ConfigProvider>
        </IntlProvider>
      </StyleProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
