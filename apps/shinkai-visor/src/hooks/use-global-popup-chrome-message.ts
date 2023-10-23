import { useState } from "react";
import { useHistory } from "react-router-dom";

import { ContentScriptMessageType } from "../service-worker/communication/content-script-message-type";
import { sendContentScriptMessage } from '../service-worker/communication/content-script-messages';
import { ServiceWorkerMessageType } from "../service-worker/communication/service-worker-message-type";
import { useIFrameMessage } from "./use-iframe-message";

export const useGlobalPopupChromeMessage = () => {
  const history = useHistory();
  const [popupVisibility, setPopupVisibility] = useState(false);
  useIFrameMessage(async (message, sender) => {
    if (message.type === ServiceWorkerMessageType.SendToAgent) {
      const params = new URLSearchParams({ context: message?.data?.textContent });
      history.push({ pathname: '/inboxes/create-job', search: params.toString() });
      sendContentScriptMessage({ type: ContentScriptMessageType.TogglePopupVisibility, data: true });
    } else if (message.type === ServiceWorkerMessageType.SendPageToAgent) {
        history.push({ pathname: '/inboxes/create-job', state: { files: [message.data.pdf]} });
        sendContentScriptMessage({ type: ContentScriptMessageType.TogglePopupVisibility, data: true });

    } else if (message.type === ServiceWorkerMessageType.ContentScript) {
      if (message.data.type === ContentScriptMessageType.TogglePopupVisibility) {
        console.log('toggle popup visibility', message, sender);
        setPopupVisibility(message.data.data !== undefined ? message.data.data : !popupVisibility);
      }
    }
  });
  return [popupVisibility];
};
