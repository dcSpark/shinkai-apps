import { useState } from "react";

import { ContentScriptBridgeMessageType, ServiceWorkerInternalMessageType } from "../service-worker/communication/internal/types";
import { useChromeMessage } from "./use-chrome-message";

export const useGlobalActionButtonChromeMessage = () => {
  const [popupVisibility, setPopupVisibility] = useState(false);
  useChromeMessage((message, sender) => {
    if (message.type === ServiceWorkerInternalMessageType.ContentScriptBridge) {
      if (message.data.type === ContentScriptBridgeMessageType.TogglePopupVisibility) {
        setPopupVisibility(message.data.data !== undefined ? message.data.data : !popupVisibility);
      }
    }
  });
  return [popupVisibility];
};
