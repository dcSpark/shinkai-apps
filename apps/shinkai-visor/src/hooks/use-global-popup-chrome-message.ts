import { useState } from "react";
import { useHistory } from "react-router-dom";

import { dataUrlToFile } from "../helpers/blob-utils";
import { sendContentScriptMessage } from "../service-worker/communication/internal";
import { ContentScriptBridgeMessageType, ServiceWorkerInternalMessageType } from "../service-worker/communication/internal/types";
import { useAuth } from "../store/auth/auth";
import { useSettings } from "../store/settings/settings";
import { useIFrameMessage } from "./use-iframe-message";

export const useGlobalPopupChromeMessage = () => {
  const history = useHistory();
  const [popupVisibility, setPopupVisibility] = useState(false);
  useIFrameMessage(async (message, sender) => {
    switch (message.type) {
      case ServiceWorkerInternalMessageType.SendToAgent: {
        const params = new URLSearchParams({ context: message?.data?.textContent });
        history.push({ pathname: '/inboxes/create-job', search: params.toString() });
        sendContentScriptMessage({ type: ContentScriptBridgeMessageType.TogglePopupVisibility, data: true });
        break;
      }
      case ServiceWorkerInternalMessageType.SendPageToAgent:
        history.push({ pathname: '/inboxes/create-job', state: { files: [message.data.pdf] } });
        sendContentScriptMessage({ type: ContentScriptBridgeMessageType.TogglePopupVisibility, data: true });
        break;
      case ServiceWorkerInternalMessageType.SendCaptureToAgent: {
        const imageFile = dataUrlToFile(message.data.image, `capture.png`);
        history.push({ pathname: '/inboxes/create-job', state: { files: [imageFile] } });
        sendContentScriptMessage({ type: ContentScriptBridgeMessageType.TogglePopupVisibility, data: true });
        break;
      }
      case ServiceWorkerInternalMessageType.ContentScriptBridge:
        switch (message.data.type) {
          case ContentScriptBridgeMessageType.TogglePopupVisibility:
            console.log('toggle popup visibility', message, sender);
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
