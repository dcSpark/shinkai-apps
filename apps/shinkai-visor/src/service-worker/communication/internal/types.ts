export enum ServiceWorkerInternalMessageType {
  ContentScriptBridge = 'content-script-bridge',
  SendToAgent = 'send-to-agent',
  SendPageToAgent = 'send-page-to-agent',
  RehydrateStore = 'rehydrate-store',
  CopyToClipboard = 'copy-to-clipboard',
  CaptureImage = 'capture-image',
  SendCaptureToAgent = 'send-capture-to-agent',
  OpenLink = 'open-link',
  QuickConnectionIntent = 'quick-connection-intent',
  OpenSidePanel = 'open-side-panel',
}

export enum ContentScriptBridgeMessageType {
  TogglePopupVisibility = 'toggle-popup-visibility',
}

export type ContentScriptBridgeMessage = {
  type: ContentScriptBridgeMessageType.TogglePopupVisibility;
  data?: boolean;
};

export type ServiceWorkerInternalMessage =
  | {
      type: ServiceWorkerInternalMessageType.OpenSidePanel;
      data?: never;
    }
  | {
      type: ServiceWorkerInternalMessageType.ContentScriptBridge;
      data: ContentScriptBridgeMessage;
    }
  | {
      type: ServiceWorkerInternalMessageType.SendToAgent;
      data: {
        textContent: string;
      };
    }
  | {
      type: ServiceWorkerInternalMessageType.SendPageToAgent;
      data: {
        filename: string;
        fileDataUrl: string;
        fileType: string;
      };
    }
  | { type: ServiceWorkerInternalMessageType.RehydrateStore; data?: never }
  | {
      type: ServiceWorkerInternalMessageType.CopyToClipboard;
      data: { content: string };
    }
  | {
      type: ServiceWorkerInternalMessageType.CaptureImage;
      data: { image: string };
    }
  | {
      type: ServiceWorkerInternalMessageType.SendCaptureToAgent;
      data: { imageDataUrl: string; filename: string };
    }
  | { type: ServiceWorkerInternalMessageType.OpenLink; data: { url: string } }
  | {
      type: ServiceWorkerInternalMessageType.QuickConnectionIntent;
      data: { nodeAddress: string };
    };
