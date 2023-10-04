import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { langMessages, locale } from '../../lang/intl';
import { store, storePersistor } from '../../store';
import { antdTheme } from '../../theme/antd-theme';
import themeStyle from '../../theme/styles.css?inline';
import { PopupRouting } from '../popup-routing/popup-routing';
import popupStyle from './popup.css?inline';

let container = document.getElementById('shinkai-popup-root');
let shadow: ShadowRoot | undefined = undefined;
if (!container) {
  const baseContainer = document.createElement('shinkai-popup-root');
  shadow = baseContainer.attachShadow({ mode: 'open' });
  container = document.createElement('div');
  container.id = 'shinkai-popup-root';
  shadow.appendChild(container);
  const htmlRoot = document.getElementsByTagName('html')[0];
  htmlRoot.prepend(baseContainer);
}
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <style>{themeStyle}</style>
    <style>{popupStyle}</style>
    <Provider store={store}>
      <PersistGate loading={null} persistor={storePersistor}>
        <StyleProvider container={shadow} hashPriority="high">
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
