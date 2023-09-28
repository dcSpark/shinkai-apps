import { ServiceWorkerMessageType } from "../../service-worker/communication/service-worker-message-type";
import { ServiceWorkerMessage } from "../../service-worker/communication/service-worker-messages";
import { ContentScriptMessage } from "./content-script-message";


export const sendContentScriptMessage = (message: ContentScriptMessage) => {
  const contentScriptMessage: ServiceWorkerMessage = { type: ServiceWorkerMessageType.ContentScript, data: message } as any;
  chrome.runtime.sendMessage<ServiceWorkerMessage>(contentScriptMessage);
}
