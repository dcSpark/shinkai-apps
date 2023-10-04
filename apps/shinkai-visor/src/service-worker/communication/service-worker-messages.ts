import { ContentScriptMessage } from './content-script-message';
import { ServiceWorkerMessageType } from './service-worker-message-type';

export type ServiceWorkerMessage =
  | { type: ServiceWorkerMessageType.ContentScript; data: ContentScriptMessage }
  | {
      type: ServiceWorkerMessageType.SendToAgent;
      data: {
        textContent: string;
      };
    };
