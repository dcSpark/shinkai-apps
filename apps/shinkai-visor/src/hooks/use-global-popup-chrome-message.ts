import { useState } from "react";
import { useHistory } from "react-router-dom";

import { ContentScriptMessageType } from "../service-worker/communication/content-script-message-type";
import { ServiceWorkerMessageType } from "../service-worker/communication/service-worker-message-type";
import { useChromeMessage } from "./use-chrome-message";

export const useGlobalPopupChromeMessage = () => {
  const history = useHistory();
  const [popupVisibility, setPopupVisibility] = useState(true);
  useChromeMessage((message, sender) => {
    if (message.type === ServiceWorkerMessageType.SendToAgent) {
      const params = new URLSearchParams({ context: message?.data?.textContent });
      history.replace({ pathname: '/jobs/create', search: params.toString() });
    } else if (message.type === ServiceWorkerMessageType.ContentScript) {
      if (message.data.type === ContentScriptMessageType.TogglePopupVisibility) {
        setPopupVisibility(message.data.data);
      }
    }
  });
  return [popupVisibility];
};
