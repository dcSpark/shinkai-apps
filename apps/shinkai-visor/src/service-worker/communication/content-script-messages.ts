import { ContentScriptMessage } from "./content-script-message";
import { ServiceWorkerMessageType } from "./service-worker-message-type";
import { ServiceWorkerMessage } from "./service-worker-messages";


export const sendContentScriptMessage = (message: ContentScriptMessage) => {
  const contentScriptMessage: ServiceWorkerMessage = { type: ServiceWorkerMessageType.ContentScript, data: message } as any;
  chrome.runtime.sendMessage<ServiceWorkerMessage>(contentScriptMessage);
}
