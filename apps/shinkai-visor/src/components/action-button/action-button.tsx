import { cn } from '@shinkai_network/shinkai-ui/utils';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { langMessages, locale } from '../../lang/intl';
import { sendMessage } from '../../service-worker/communication/internal';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';
import themeStyle from '../../theme/styles.css?inline';

export const SHINKAI_ACTION_ELEMENT_NAME = 'shinkai-action-button-root';

const baseContainer = document.createElement(SHINKAI_ACTION_ELEMENT_NAME);
const shadow = baseContainer.attachShadow({ mode: 'open' });
const container = document.createElement('div');
container.id = 'root';
shadow.appendChild(container);
const htmlRoot = document.getElementsByTagName('html')[0];
htmlRoot.prepend(baseContainer);

/*
  Note: There's no current support to use chrome sidepanel API on playwright for our e2e tests
  Workaround: Adding an action button (only in dev mode) to open the sidepanel through service worker
 */

const ActionButton = () => {
  return (
    <button
      className={cn(
        'block w-full select-none space-x-1 rounded-md bg-gray-500 px-2 font-mono text-sm font-medium text-gray-500 text-white',
      )}
      data-testid="action-button"
      onClick={() => {
        sendMessage({
          type: ServiceWorkerInternalMessageType.OpenSidePanel,
        });
      }}
    >
      <span className="">Sidepanel</span>
    </button>
  );
};

if (import.meta.env.DEV) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <style>{themeStyle}</style>
      <IntlProvider locale={locale} messages={langMessages}>
        <div className="shadow-4xl fixed right-[2px] top-[80px] z-[1500000000] overflow-hidden">
          <ActionButton />
        </div>
      </IntlProvider>
    </React.StrictMode>,
  );
}
