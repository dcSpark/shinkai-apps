import { Buffer } from 'buffer';

import { sendMessage } from './communication/internal';
import {
  ServiceWorkerInternalMessage,
  ServiceWorkerInternalMessageType,
} from './communication/internal/types';
import ContextType = chrome.runtime.ContextType;

enum ContextMenu {
  SendPageToAgent = 'send-page-to-agent',
  SendToAgent = 'send-to-agent',
  SendCaptureToAgent = 'send-capture-to-agent',
}

export const OPEN_SIDEPANEL_DELAY_MS = 600;

export const openSidePanel = async (tab: chrome.tabs.Tab | undefined) => {
  if (!tab) return;
  await chrome.sidePanel.open({ windowId: tab.windowId });
  const contexts = await chrome.runtime.getContexts({
    contextTypes: [ContextType.SIDE_PANEL],
  });
  return contexts.length > 0;
};

export const sendPageToAgent = async (
  info: chrome.contextMenus.OnClickData | undefined,
  tab: chrome.tabs.Tab | undefined,
) => {
  // At this point, agents can just process text
  if (!tab?.id) {
    return;
  }
  const [htmlContent] = await chrome.scripting.executeScript({
    target: { tabId: tab?.id },
    func: () => {
      return document.documentElement.outerHTML;
    },
    args: [],
  });
  const fileType = 'text/html';
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SendPageToAgent,
    data: {
      filename: `${encodeURIComponent(tab.url || Date.now())}.html`,
      fileType: fileType,
      fileDataUrl: `data:${fileType};base64,${Buffer.from(
        htmlContent.result,
      ).toString('base64')}`,
    },
  };
  sendMessage(message);
};

export const sendToAgent = async (
  info: chrome.contextMenus.OnClickData | undefined,
  tab: chrome.tabs.Tab | undefined,
) => {
  // At this point, agents can just process text
  if (!info?.selectionText || !tab?.id) {
    return;
  }
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SendToAgent,
    data: {
      textContent: info.selectionText,
    },
  };
  sendMessage(message);
};

export const sendCaptureToAgent = async (
  info: chrome.contextMenus.OnClickData | undefined,
  tab: chrome.tabs.Tab | undefined,
) => {
  if (!tab?.id) {
    return;
  }
  const image = await new Promise<string>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.captureVisibleTab(
        tab.windowId,
        { format: 'jpeg', quality: 92 },
        (image) => {
          resolve(image);
        },
      );
    });
  });
  let message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.CaptureImage,
    data: { image },
  };
  const croppedImage =
    await chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(
      tab.id,
      message,
    );
  message = {
    type: ServiceWorkerInternalMessageType.SendCaptureToAgent,
    data: {
      imageDataUrl: croppedImage,
      filename: `${encodeURIComponent(tab.url || 'capture')}.jpeg`,
    },
  };
  sendMessage(message);
};

const menuActions = new Map<
  string | number,
  (
    info: chrome.contextMenus.OnClickData | undefined,
    tab: chrome.tabs.Tab | undefined,
  ) => void
>([
  [ContextMenu.SendPageToAgent, sendPageToAgent],
  [ContextMenu.SendToAgent, sendToAgent],
  [ContextMenu.SendCaptureToAgent, sendCaptureToAgent],
]);

const registerMenu = () => {
  chrome.contextMenus.create({
    id: ContextMenu.SendPageToAgent,
    title: 'Send Page to Agent',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: ContextMenu.SendToAgent,
    title: 'Send Selection to Agent',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: ContextMenu.SendCaptureToAgent,
    title: 'Send Capture to Agent',
    contexts: ['all'],
  });
};

chrome.runtime.onInstalled.addListener(async (details) => {
  registerMenu();

  if (details.reason === 'install') {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('src/components/setup/setup.html'),
    });
  }
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;
  const action = menuActions.get(info.menuItemId);
  if (!action) return;
  chrome.sidePanel.open({ windowId: tab.windowId });
  // wait for side panel to open
  setTimeout(() => {
    action(info, tab);
  }, OPEN_SIDEPANEL_DELAY_MS);
});
