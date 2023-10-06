import { ContentScriptMessage } from "./content-script-message";
import { ServiceWorkerMessageType } from "./service-worker-message-type";
import { ServiceWorkerMessage } from "./service-worker-messages";


export const sendContentScriptMessage = (message: ContentScriptMessage, tabId?: number) => {
  const contentScriptMessage: ServiceWorkerMessage = { type: ServiceWorkerMessageType.ContentScript, data: message };
  console.log('sendContentScriptMessage', tabId)
  if (tabId) {
    chrome.tabs.sendMessage<ServiceWorkerMessage>(tabId, contentScriptMessage);
  } else {
    chrome.runtime.sendMessage<ServiceWorkerMessage>(contentScriptMessage);
  }
}
