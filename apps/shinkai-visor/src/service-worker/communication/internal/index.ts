import { useAuth } from '../../../store/auth/auth';
import { useSettings } from '../../../store/settings/settings';
import {
  ContentScriptBridgeMessage,
  ServiceWorkerInternalMessage,
  ServiceWorkerInternalMessageType,
} from './types';
import ContextType = chrome.runtime.ContextType;
import {
  sendCaptureToAgent,
  sendPageToAgent,
  sendVectorResourceFoundToAgent,
  sendVectorResourceFoundToVectorFs,
  summarizePage,
} from '../../action';

export const sendContentScriptMessage = (
  message: ContentScriptBridgeMessage,
  tabId?: number,
) => {
  const contentScriptMessage: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.ContentScriptBridge,
    data: message,
  };
  if (tabId) {
    chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(
      tabId,
      contentScriptMessage,
    );
  } else {
    chrome.runtime.sendMessage<ServiceWorkerInternalMessage>(
      contentScriptMessage,
    );
  }
};

export const sendMessage = (
  message: ServiceWorkerInternalMessage,
  tabId?: number,
) => {
  if (tabId) {
    chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(tabId, message);
  } else {
    chrome.runtime.sendMessage<ServiceWorkerInternalMessage>(message);
  }
};

export const listen = (): void => {
  chrome.runtime.onMessage.addListener(
    (message: ServiceWorkerInternalMessage, sender, sendResponse) => {
      console.log('sw onMessage', message, sender);
      // It allows inter content scripts communication.
      // SW act as a reverse proxy between content scripts in the same tab id
      switch (message.type) {
        case ServiceWorkerInternalMessageType.IsSidePanelOpen: {
          (async () => {
            if (!sender?.tab?.id) return;
            const contexts = await chrome.runtime.getContexts({
              contextTypes: [ContextType.SIDE_PANEL],
            });
            return sendResponse(contexts.length > 0);
          })();
          return true;
        }
        case ServiceWorkerInternalMessageType.OpenSidePanel: {
          (async () => {
            if (!sender?.tab?.id) return;
            await chrome.sidePanel.open({ windowId: sender.tab.windowId });
            const contexts = await chrome.runtime.getContexts({
              contextTypes: [ContextType.SIDE_PANEL],
            });
            return sendResponse(contexts.length > 0);
          })();
          return true;
        }
        case ServiceWorkerInternalMessageType.CloseSidePanel: {
          (async () => {
            await chrome.sidePanel.setOptions({ enabled: false });
            await chrome.sidePanel.setOptions({ enabled: true });
          })();
          return true;
        }
        case ServiceWorkerInternalMessageType.SendCaptureToAgent: {
          if (!sender?.tab?.id) {
            return;
          }
          (async () => {
            await sendCaptureToAgent(undefined, sender.tab);
          })();
          return true;
        }
        case ServiceWorkerInternalMessageType.SendPageToAgent: {
          if (!sender?.tab?.id) {
            return;
          }
          (async () => {
            await sendPageToAgent(undefined, sender.tab);
          })();
          return true;
        }
        case ServiceWorkerInternalMessageType.SummarizePage: {
          if (!sender?.tab?.id) {
            return;
          }
          (async () => {
            await summarizePage(undefined, sender.tab);
          })();
          return true;
        }

        case ServiceWorkerInternalMessageType.VectorResourceFound: {
          if (!sender?.tab?.id) {
            return;
          }
          (async () => {
            await sendVectorResourceFoundToAgent(
              undefined,
              sender.tab,
              message.data.vectorResourceUrl,
            );
          })();
          return true;
        }
        case ServiceWorkerInternalMessageType.UploadVectorResource: {
          if (!sender?.tab?.id) {
            return;
          }
          (async () => {
            await sendVectorResourceFoundToVectorFs(
              undefined,
              sender.tab,
              message.data.vectorResourceUrl,
            );
          })();
          return true;
        }
        case ServiceWorkerInternalMessageType.ContentScriptBridge:
          if (!sender?.tab?.id) {
            return;
          }
          console.log(
            'sw onMessage - forwarding message to tab',
            message,
            sender,
            sender?.tab,
          );
          sendContentScriptMessage(message.data, sender?.tab?.id);
          break;
        case ServiceWorkerInternalMessageType.RehydrateStore:
          // Internal rehydrate
          chrome.tabs.query({}, (tabs) =>
            tabs.forEach((tab) => sendMessage(message, tab.id)),
          );
          useAuth.persist.rehydrate();
          useSettings.persist.rehydrate();
          break;
        case ServiceWorkerInternalMessageType.OpenLink:
          chrome.tabs.create({ url: message.data.url });
          break;
        default:
          break;
      }
    },
  );
};
