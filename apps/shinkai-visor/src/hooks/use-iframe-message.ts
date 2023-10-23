import { useEffect } from "react";

import { srcUrlResolver } from "../helpers/src-url-resolver";
import { ServiceWorkerMessage } from "../service-worker/communication/service-worker-messages";

export type UseChromeMessageCallbackParameters = [message: ServiceWorkerMessage, sender: chrome.runtime.MessageSender];
export type UseChromeMessageCallback = (...params: UseChromeMessageCallbackParameters) => void;

export const useIFrameMessage = (callback: UseChromeMessageCallback) => {
  useEffect(() => {
    const onMessage = (message: ServiceWorkerMessage, sender: chrome.runtime.MessageSender): void => {
      if (sender.tab) {
        return;
      }
      console.info('on chrome message', window.location.href, message, sender);
      if (typeof callback === 'function') {
        callback(message, sender);
      }
    };
    const onIFrameMessage = (event: MessageEvent<{ message: ServiceWorkerMessage, sender: chrome.runtime.MessageSender }>) => {
      console.log('on iframe message', event);
      if (!event.origin.startsWith(srcUrlResolver('/'))) {
        console.log('message coming from an unknown origin', event.origin);
      }
      onMessage(event?.data?.message, event?.data?.sender);
    }
    window.removeEventListener('message', onIFrameMessage);
    window.addEventListener('message', onIFrameMessage);
    return () => {
      window.removeEventListener('message', onIFrameMessage);
    };
  });
  return;
}
