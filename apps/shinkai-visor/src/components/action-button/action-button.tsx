import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import shinkaiLogo from '../../assets/icons/shinkai-min.svg';
import { ContentScriptMessageType } from '../../service-worker/communication/content-script-message-type';
import { sendContentScriptMessage } from '../../service-worker/communication/content-script-messages';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useGlobalActionButtonChromeMessage } from '../../hooks/use-global-action-button-chrome-message';
import { langMessages, locale } from '../../lang/intl';
import { store, storePersistor } from '../../store';
import themeStyle from '../../theme/styles.css?inline';
import popupStyle from './action-button.css?inline';

let container = document.getElementById('shinkai-action-button-root');
let shadow: ShadowRoot | undefined = undefined;
if (!container) {
  const baseContainer = document.createElement('shinkai-action-button-root');
  shadow = baseContainer.attachShadow({ mode: 'open' });
  container = document.createElement('div');
  container.id = 'shinkai-action-button-root';
  shadow.appendChild(container);
  const htmlRoot = document.getElementsByTagName('html')[0];
  htmlRoot.prepend(baseContainer);
}

export const ActionButton = () => {
  const [popupVisibility] = useGlobalActionButtonChromeMessage();
  const togglePopupVisibility = () => {
    sendContentScriptMessage({
      type: ContentScriptMessageType.TogglePopupVisibility,
      data: !popupVisibility,
    });
  };
  return (
    <div className="p-2" onClick={() => togglePopupVisibility()}>
      <img
        alt="shinkai-app-logo"
        className="w-full h-full"
        src={srcUrlResolver(shinkaiLogo)}
      />
    </div>
  );
};

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <style>{themeStyle}</style>
    <style>{popupStyle}</style>
    <Provider store={store}>
      <PersistGate loading={null} persistor={storePersistor}>
        <IntlProvider locale={locale} messages={langMessages}>
          <div className="fixed w-[50px] h-[50px] top-32 right-2 overflow-hidden bg-background z-[1500000000] border-solid border-primary border-2 rounded-lg">
            <ActionButton></ActionButton>
          </div>
        </IntlProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);
