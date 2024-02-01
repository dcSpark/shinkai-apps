import { useState } from 'react';

import { ServiceWorkerInternalMessageType } from '../service-worker/communication/internal/types';
import { useAuth } from '../store/auth/auth';
import { useSettings } from '../store/settings/settings';
import { useChromeMessage } from './use-chrome-message';

export const useGlobalActionButtonChromeMessage = () => {
  const [popupVisibility, setPopupVisibility] = useState(false);
  useChromeMessage((message) => {
    switch (message.type) {
      case ServiceWorkerInternalMessageType.RehydrateStore:
        useAuth.persist.rehydrate();
        useSettings.persist.rehydrate();
        break;
      default:
        break;
    }
  });
  return [popupVisibility];
};
