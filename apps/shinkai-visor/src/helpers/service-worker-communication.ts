import { ServiceWorkerMessageType } from "../service-worker/service-worker-types"

export const sendMessageToSw = (message: ServiceWorkerMessageType) => {
    chrome.runtime.sendMessage(message);
}
