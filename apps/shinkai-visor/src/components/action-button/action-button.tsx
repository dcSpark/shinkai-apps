import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import shinkaiLogo from '../../assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useGlobalActionButtonChromeMessage } from '../../hooks/use-global-action-button-chrome-message';
import { langMessages, locale } from '../../lang/intl';
import { sendContentScriptMessage } from '../../service-worker/communication/internal';
import { ContentScriptBridgeMessageType } from '../../service-worker/communication/internal/types';
import { useSettings } from '../../store/settings/settings';
import themeStyle from '../../theme/styles.css?inline';

export const SHINKAI_ACTION_ELEMENT_NAME = 'shinkai-action-button-root';

const baseContainer = document.createElement(SHINKAI_ACTION_ELEMENT_NAME);
const shadow = baseContainer.attachShadow({ mode: 'open' });
const container = document.createElement('div');
container.id = 'root';
shadow.appendChild(container);
const htmlRoot = document.getElementsByTagName('html')[0];
htmlRoot.prepend(baseContainer);

export const ActionButton = () => {
  const [popupVisibility] = useGlobalActionButtonChromeMessage();
  const settings = useSettings((settingsStore) => settingsStore.settings);

  const togglePopupVisibility = async () => {
    console.log('clicked!');
    sendContentScriptMessage({
      type: ContentScriptBridgeMessageType.TogglePopupVisibility,
    });
  };
  return (
    <button
      className={cn(
        'flex flex-col items-center justify-center space-y-1',
        !popupVisibility && 'animate-breath',
        settings?.hideActionButton ? 'hidden' : 'flex',
      )}
      onClick={() => togglePopupVisibility()}
    >
      <motion.div className="h-[50px] w-[50px] rounded-lg bg-gray-500 p-2">
        <motion.img
          alt="shinkai-app-logo"
          animate={{
            rotate: popupVisibility ? -10 : 0,
          }}
          className={'h-full w-full'}
          src={srcUrlResolver(shinkaiLogo)}
        />
      </motion.div>
      <motion.kbd className="pointer-events-none block h-0 w-full select-none space-x-1 rounded-md bg-gray-500 px-2 font-mono text-sm font-medium text-gray-500 text-white  group-hover:h-auto">
        <span>⌘</span>
        <span>﹐</span>
      </motion.kbd>
    </button>
  );
};
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <style>{themeStyle}</style>
    <IntlProvider locale={locale} messages={langMessages}>
      <div className="shadow-4xl fixed right-[2px] top-[120px] z-[1500000000] overflow-hidden">
        <ActionButton />
      </div>
    </IntlProvider>
  </React.StrictMode>,
);
