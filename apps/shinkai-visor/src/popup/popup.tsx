import '../theme/styles.css';
import './popup.css';

import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { MemoryRouter as Router } from 'react-router-dom';

import { PopupRouting } from '../components/popup-routing/popup-routing';
import { langMessages, locale } from '../lang/intl';
import { antdTheme } from '../theme/antd-theme';

const container = document.getElementById('root');
if (!container) {
  throw new Error('root container not found');
}
const root = createRoot(container);

root.render(
  <React.StrictMode>
        <StyleProvider hashPriority="high">
      <IntlProvider locale={locale} messages={langMessages}>
        <ConfigProvider theme={antdTheme}>
          <Router>
            <PopupRouting></PopupRouting>
          </Router>
        </ConfigProvider>
      </IntlProvider>
    </StyleProvider>
  </React.StrictMode>
);
