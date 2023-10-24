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

const baseContainer = document.createElement('shinkai-action-button-root');
const shadow = baseContainer.attachShadow({ mode: 'open' });
const container = document.createElement('div');
container.id = 'root';
shadow.appendChild(container);
const htmlRoot = document.getElementsByTagName('html')[0];
htmlRoot.prepend(baseContainer);

export const ActionButton = () => {
  const [popupVisibility] = useGlobalActionButtonChromeMessage();
  const togglePopupVisibility = async () => {
    sendContentScriptMessage({
      type: ContentScriptMessageType.TogglePopupVisibility,
    });
  };
  return (
    <div
      className={cn(
        'p-1 w-[50px] h-[50px] flex flex-col space-y-1 items-center justify-center',
        !popupVisibility && 'animate-breath'
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
      <span className="text-xs text-white">
        <kbd className="bg-primary pointer-events-none inline-flex justify-center h-5 select-none items-center gap-1 rounded border px-2 font-mono text-sm font-medium opacity-100">
          <span>⌘</span>
          <span>﹐</span>
        </kbd>
      </span>
    </div>
  );
};
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <style>{themeStyle}</style>
    <IntlProvider locale={locale} messages={langMessages}>
      <div className="fixed top-[120px] right-[2px] overflow-hidden bg-secondary-600 z-[1500000000] shadow-3xl rounded-lg">
        <ActionButton />
      </div>
    </IntlProvider>
  </React.StrictMode>
);
