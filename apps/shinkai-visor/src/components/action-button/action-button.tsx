import { motion } from 'framer-motion';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import shinkaiLogo from '../../assets/icons/shinkai-min.svg';
import { cn } from '../../helpers/cn-utils';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useGlobalActionButtonChromeMessage } from '../../hooks/use-global-action-button-chrome-message';
import { langMessages, locale } from '../../lang/intl';
import { ContentScriptMessageType } from '../../service-worker/communication/content-script-message-type';
import { sendContentScriptMessage } from '../../service-worker/communication/content-script-messages';
import themeStyle from '../../theme/styles.css?inline';
import popupStyle from './action-button.css?inline';

const baseContainer = document.createElement('shinkai-action-button-root');
const shadow = baseContainer.attachShadow({ mode: 'open' });
const container = document.createElement('div');
container.id = 'root';
shadow.appendChild(container);
const htmlRoot = document.getElementsByTagName('html')[0];
htmlRoot.prepend(baseContainer);

export const ActionButton = () => {
  const [popupVisibility] = useGlobalActionButtonChromeMessage();
  const togglePopupVisibility = () => {
    sendContentScriptMessage({
      type: ContentScriptMessageType.TogglePopupVisibility,
    });
  };
  return (
    <div
      className={cn(
        'p-1 w-[50px] h-[50px] flex flex-col space-y-1 items-center justify-center',
        !popupVisibility && 'animate-pulse'
      )}
      onClick={() => togglePopupVisibility()}
    >
      <motion.div
        animate={{
          rotate: popupVisibility ? -22 : 0,
        }}
        className="w-4 h-4"
      >
        <img
          alt="shinkai-app-logo"
          className={'w-full h-full'}
          src={srcUrlResolver(shinkaiLogo)}
        />
      </motion.div>
      <span className="text-xs text-center">⌘ + ,</span>
    </div>
  );
};
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <style>{themeStyle}</style>
    <style>{popupStyle}</style>
    <IntlProvider locale={locale} messages={langMessages}>
      <div className="fixed top-32 right-2 overflow-hidden bg-background z-[1500000000] border-solid border-primary border-2 rounded-lg">
        <ActionButton></ActionButton>
      </div>
    </IntlProvider>
  </React.StrictMode>
);
