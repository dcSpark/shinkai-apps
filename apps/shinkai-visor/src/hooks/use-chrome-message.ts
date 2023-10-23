import { useEffect } from "react";

import { ServiceWorkerMessage } from "../service-worker/communication/service-worker-messages";

export type UseChromeMessageCallbackParameters = [message: ServiceWorkerMessage, sender: chrome.runtime.MessageSender];
export type UseChromeMessageCallback = (...params: UseChromeMessageCallbackParameters) => void;

export const useChromeMessage = (callback: UseChromeMessageCallback) => {
  useEffect(() => {
    function onMessage(message: ServiceWorkerMessage, sender: chrome.runtime.MessageSender): void {
      if (sender.tab) {
        return;
      }
      console.info('on chrome message', window.location.href, message, sender);
      if (typeof callback === 'function') {
        callback(message, sender);
      }
    };
    chrome.runtime.onMessage.removeListener(onMessage);
    chrome.runtime.onMessage.addListener(onMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  });
  return;
}
