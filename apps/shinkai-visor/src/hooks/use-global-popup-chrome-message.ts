import { useState } from "react";
import { useHistory } from "react-router-dom";

import { sendContentScriptMessage } from "../service-worker/communication/internal";
import { ContentScriptBridgeMessageType, ServiceWorkerInternalMessageType } from "../service-worker/communication/internal/types";
import { useIFrameMessage } from "./use-iframe-message";

export const useGlobalPopupChromeMessage = () => {
  const history = useHistory();
  const [popupVisibility, setPopupVisibility] = useState(false);
  useIFrameMessage(async (message, sender) => {
    if (message.type === ServiceWorkerInternalMessageType.SendToAgent) {
      const params = new URLSearchParams({ context: message?.data?.textContent });
      history.push({ pathname: '/inboxes/create-job', search: params.toString() });
      sendContentScriptMessage({ type: ContentScriptBridgeMessageType.TogglePopupVisibility, data: true });
    } else if (message.type === ServiceWorkerInternalMessageType.SendPageToAgent) {
      history.push({ pathname: '/inboxes/create-job', state: { files: [message.data.pdf] } });
      sendContentScriptMessage({ type: ContentScriptBridgeMessageType.TogglePopupVisibility, data: true });

    } else if (message.type === ServiceWorkerInternalMessageType.ContentScriptBridge) {
      if (message.data.type === ContentScriptBridgeMessageType.TogglePopupVisibility) {
        console.log('toggle popup visibility', message, sender);
        setPopupVisibility(message.data.data !== undefined ? message.data.data : !popupVisibility);
      }
    }
  });
  return [popupVisibility];
};
