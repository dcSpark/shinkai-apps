import { useEffect } from "react";

import { ServiceWorkerInternalMessage } from "../service-worker/communication/internal/types";


export type UseChromeMessageCallbackParameters = [message: ServiceWorkerInternalMessage, sender: chrome.runtime.MessageSender];
export type UseChromeMessageCallback = (...params: UseChromeMessageCallbackParameters) => void;

export const useChromeMessage = (callback: UseChromeMessageCallback) => {
  useEffect(() => {
    function onMessage(message: ServiceWorkerInternalMessage, sender: chrome.runtime.MessageSender): void {
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
