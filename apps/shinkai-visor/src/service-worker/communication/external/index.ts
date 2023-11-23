import { ServiceWorkerExternalMessage } from "./types";

export const listen = (): void => {
  chrome.runtime.onMessageExternal.addListener((message: ServiceWorkerExternalMessage, sender, sendResponse) => {
    console.log('sw onMessage external', message, sender);
    // TODO: Implements permission layer

  });
}
