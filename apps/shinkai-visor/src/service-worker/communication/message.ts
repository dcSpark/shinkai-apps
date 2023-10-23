import { sendContentScriptMessage } from "./content-script-messages";
import { ServiceWorkerMessageType } from "./service-worker-message-type";
import { ServiceWorkerMessage } from "./service-worker-messages";

chrome.runtime.onMessage.addListener((message: ServiceWorkerMessage, sender) => {
  console.log('sw onMessage', message, sender);
  // It allows inter content scripts communication.
  // SW act as a reverse proxy between content scripts in the same tab id
  if (message.type === ServiceWorkerMessageType.ContentScript) {
    if (!sender?.tab?.id) {
      return;
    }
    console.log('sw onMessage - forwarding message to tab', message, sender, sender?.tab);
    sendContentScriptMessage(message.data, sender?.tab?.id);
  }
});
