import { useState } from "react";

import { ContentScriptBridgeMessageType, ServiceWorkerInternalMessageType } from "../service-worker/communication/internal/types";
import { useAuth } from "../store/auth/auth";
import { useSettings } from "../store/settings/settings";
import { useChromeMessage } from "./use-chrome-message";

export const useGlobalActionButtonChromeMessage = () => {
  const [popupVisibility, setPopupVisibility] = useState(false);
  useChromeMessage((message) => {
    switch (message.type) {
      case ServiceWorkerInternalMessageType.ContentScriptBridge:
        switch (message.data.type) {
          case ContentScriptBridgeMessageType.TogglePopupVisibility:
            setPopupVisibility(message.data.data !== undefined ? message.data.data : !popupVisibility);
            break;
          default:
            break;
        }
        break;
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
