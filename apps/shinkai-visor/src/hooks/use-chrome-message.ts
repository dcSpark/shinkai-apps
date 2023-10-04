import { useEffect } from "react";

import { ServiceWorkerMessage } from "../service-worker/communication/service-worker-messages";

export type UseChromeMessageCallbackParameters = [message: ServiceWorkerMessage, sender: chrome.runtime.MessageSender];
export type UseChromeMessageCallback = (...params: UseChromeMessageCallbackParameters) => void;

export const useChromeMessage = (callback: UseChromeMessageCallback) => {
  useEffect(() => {
    const onMessage: UseChromeMessageCallback = (message, sender) => {
      if (typeof callback === 'function') {
        callback(message, sender);
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, [callback]);
  return;
}
