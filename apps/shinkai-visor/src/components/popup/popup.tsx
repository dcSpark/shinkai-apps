import { queryClient } from '@shinkai_network/shinkai-node-state/lib/constants';
import { QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { langMessages, locale } from '../../lang/intl';
import { store, storePersistor } from '../../store';
import globalStyle from '../../theme/styles.css?inline';
import { PopupRouting } from '../popup-routing/popup-routing';
import popupStyle from './popup.css?inline';

let container = document.getElementById('shinkai-popup-root');
let shadowRoot: ShadowRoot | undefined = undefined;
if (!container) {
  const baseContainer = document.createElement('shinkai-popup-root');
  shadowRoot = baseContainer.attachShadow({ mode: 'closed' });
  container = document.createElement('div');
  container.id = 'shinkai-popup-root';
  shadowRoot.appendChild(container);
  const htmlRoot = document.getElementsByTagName('html')[0];
  htmlRoot.prepend(shadowRoot);
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <style>{globalStyle}</style>
    <style>{popupStyle}</style>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={storePersistor}>
          <IntlProvider locale={locale} messages={langMessages}>
            <div className="fixed w-[357px] h-[600px] top-32 right-16 overflow-hidden z-[1500000000]">
              <Router>
                <PopupRouting></PopupRouting>
              </Router>
            </div>
          </IntlProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
