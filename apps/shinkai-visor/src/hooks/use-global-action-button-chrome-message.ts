import { ServiceWorkerInternalMessageType } from '../service-worker/communication/internal/types';
import { useAuth } from '../store/auth/auth';
import { useSettings } from '../store/settings/settings';
import { useChromeMessage } from './use-chrome-message';

export const useGlobalActionButtonChromeMessage = () => {
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
};
