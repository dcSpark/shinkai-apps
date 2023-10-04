import { ServiceWorkerMessageType } from "./service-worker-message-type";

chrome.runtime.onMessage.addListener((message, sender) => {
  console.log('sw onMessage', message, sender);
  // It allows inter content scripts communication.
  // SW act as a reverse proxy between content scripts in the same tab id
  if (message.type === ServiceWorkerMessageType.ContentScript) {
    if (!sender?.tab?.id) {
      return;
    }
    console.log('sw onMessage - forwarding message to tab', message, sender);
    chrome.tabs.sendMessage(sender?.tab?.id, message);
  }
});
