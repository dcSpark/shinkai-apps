import { ServiceWorkerInternalMessage, ServiceWorkerInternalMessageType } from "./communication/internal/types";

enum ContextMenu {
  SendPageToAgent = 'send-page-to-agent',
  SendToAgent = 'send-to-agent',
}

const sendPageToAgent = async (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
  // At this point, agents can just process text
  if (!tab?.id) {
    return;
  }
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SendPageToAgent,
    data: {},
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

const menuActions = new Map<string | number, (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => void>([
  [ContextMenu.SendPageToAgent, sendPageToAgent],
  [ContextMenu.SendToAgent, sendToAgent],
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
