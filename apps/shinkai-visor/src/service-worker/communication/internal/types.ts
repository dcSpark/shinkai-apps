export enum ServiceWorkerInternalMessageType {
  ContentScriptBridge = 'content-script-bridge',
  SendToAgent = 'send-to-agent',
  SendPageToAgent = 'send-page-to-agent',
  RehydrateStore = 'rehydrate-store',
  CopyToClipboard = 'copy-to-clipboard',
}

export enum ContentScriptBridgeMessageType {
  TogglePopupVisibility = 'toggle-popup-visibility',
}

export type ContentScriptBridgeMessage =
  { type: ContentScriptBridgeMessageType.TogglePopupVisibility, data?: boolean };

export type ServiceWorkerInternalMessage =
  | { type: ServiceWorkerInternalMessageType.ContentScriptBridge; data: ContentScriptBridgeMessage }
  | {
    type: ServiceWorkerInternalMessageType.SendToAgent;
    data: {
      textContent: string;
    };
  }
  | {
    type: ServiceWorkerInternalMessageType.SendPageToAgent;
    data: {
      pdf?: File;
    }
  }
  | { type: ServiceWorkerInternalMessageType.RehydrateStore, data?: never }
  | { type: ServiceWorkerInternalMessageType.CopyToClipboard, data: { content: string } };
;
