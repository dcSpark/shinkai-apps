import { useState } from "react";

import { ContentScriptMessageType } from "../service-worker/communication/content-script-message-type";
import { ServiceWorkerMessageType } from "../service-worker/communication/service-worker-message-type";
import { useChromeMessage } from "./use-chrome-message";

export const useGlobalActionButtonChromeMessage = () => {
  const [popupVisibility, setPopupVisibility] = useState(false);
  useChromeMessage((message, sender) => {
    if (message.type === ServiceWorkerMessageType.ContentScript) {
      if (message.data.type === ContentScriptMessageType.TogglePopupVisibility) {
        setPopupVisibility(message.data.data !== undefined ? message.data.data : !popupVisibility);
      }
    }
  });
  return [popupVisibility];
};
