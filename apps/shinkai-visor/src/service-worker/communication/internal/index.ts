import { ContentScriptBridgeMessage, ServiceWorkerInternalMessage, ServiceWorkerInternalMessageType } from "./types";

export const sendContentScriptMessage = (message: ContentScriptBridgeMessage, tabId?: number) => {
  const contentScriptMessage: ServiceWorkerInternalMessage = { type: ServiceWorkerInternalMessageType.ContentScriptBridge, data: message };
  if (tabId) {
    chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(tabId, contentScriptMessage);
  } else {
    chrome.runtime.sendMessage<ServiceWorkerInternalMessage>(contentScriptMessage);
  }
}

export const sendMessage = (message: ServiceWorkerInternalMessage, tabId?: number) => {
  if (tabId) {
    chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(tabId, message);
  } else {
    chrome.runtime.sendMessage<ServiceWorkerInternalMessage>(message);
  }
}

export const listen = (): void => {
  chrome.runtime.onMessage.addListener((message: ServiceWorkerInternalMessage, sender) => {
    console.log('sw onMessage', message, sender);
    // It allows inter content scripts communication.
    // SW act as a reverse proxy between content scripts in the same tab id
    switch (message.type) {
      case ServiceWorkerInternalMessageType.ContentScriptBridge:
        if (!sender?.tab?.id) {
          return;
        }
        console.log('sw onMessage - forwarding message to tab', message, sender, sender?.tab);
        sendContentScriptMessage(message.data, sender?.tab?.id);
        break;
      case ServiceWorkerInternalMessageType.RehydrateStore:
        // Internal rehydrate
        chrome.tabs.query({}, (tabs) => tabs.forEach(tab => sendMessage(message, tab.id)));
        break;
      case ServiceWorkerInternalMessageType.CopyToClipboard:
        if (!sender?.tab?.id) {
          return;
        }
        chrome.scripting.executeScript({
          target: { tabId: sender?.tab?.id },
          func: (text: string) => {
            navigator.clipboard.writeText(text);
          },
          args: [message.data.content],
        });
        break;
      default:
        break;
    }
  });
}
