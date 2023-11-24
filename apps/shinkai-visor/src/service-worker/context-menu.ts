import { ServiceWorkerInternalMessage, ServiceWorkerInternalMessageType } from "./communication/internal/types";

enum ContextMenu {
  SendPageToAgent = 'send-page-to-agent',
  SendToAgent = 'send-to-agent',
  SendCaptureToAgent = 'send-capture-to-agent',
}

const sendPageToAgent = async (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
  // At this point, agents can just process text
  if (!tab?.id) {
    return;
  }
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SendPageToAgent,
    data: {
      filename: `${encodeURIComponent(tab.url || Date.now())}.pdf`
    },
  };
  chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(tab.id, message);
}

const sendToAgent = (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
  // At this point, agents can just process text
  if (!info.selectionText || !tab?.id) {
    return;
  }
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SendToAgent,
    data: {
      textContent: info.selectionText,
    },
  }
  chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(tab.id, message);
}

const sendCaptureToAgent = async (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
  if (!tab?.id) {
    return;
  }
  const image = await new Promise<string>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 100 }, (image) => {
        resolve(image);
      });
    })
  });
  let message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.CaptureImage,
    data: { image },
  };
  const croppedImage = await chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(tab.id, message);
  console.log('cropped image', croppedImage);
  message = {
    type: ServiceWorkerInternalMessageType.SendCaptureToAgent,
    data: { image: croppedImage, filename: `${encodeURIComponent(tab.url || 'capture')}.png` },
  };
  chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(tab.id, message);
}

const menuActions = new Map<string | number, (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => void>([
  [ContextMenu.SendPageToAgent, sendPageToAgent],
  [ContextMenu.SendToAgent, sendToAgent],
  [ContextMenu.SendCaptureToAgent, sendCaptureToAgent],
]);

const registerMenu = () => {
  chrome.contextMenus.create(
    {
      id: ContextMenu.SendPageToAgent,
      title: 'Send Page to Agent',
      contexts: ['all']
    }
  );
  chrome.contextMenus.create({
    id: ContextMenu.SendToAgent,
    title: 'Send Selection to Agent',
    contexts: ['selection']
  });
  chrome.contextMenus.create(
    {
      id: ContextMenu.SendCaptureToAgent,
      title: 'Send capture to Agent',
      contexts: ['all']
    }
  );
}

chrome.runtime.onInstalled.addListener(() => {
  registerMenu();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const action = menuActions.get(info.menuItemId);
  if (action) {
    action(info, tab);
  }
});
