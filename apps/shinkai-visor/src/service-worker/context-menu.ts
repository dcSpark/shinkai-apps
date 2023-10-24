import { ServiceWorkerMessageType } from "./communication/service-worker-message-type";
import { ServiceWorkerMessage } from "./communication/service-worker-messages";

enum ContextMenu {
  SendPageToAgent = 'send-page-to-agent',
  SendToAgent = 'send-to-agent',
}

const sendPageToAgent = async (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
  // At this point, agents can just process text
  if (!tab?.id) {
    return;
  }
  const message: ServiceWorkerMessage = {
    type: ServiceWorkerMessageType.SendPageToAgent,
    data: {},
  };
  chrome.tabs.sendMessage<ServiceWorkerMessage>(tab.id, message);  
}

const sendToAgent = (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
  // At this point, agents can just process text
  if (!info.selectionText || !tab?.id) {
    return;
  }
  const message: ServiceWorkerMessage = {
    type: ServiceWorkerMessageType.SendToAgent,
    data: {
      textContent: info.selectionText,
    },
  }
  chrome.tabs.sendMessage<ServiceWorkerMessage>(tab.id, message);
}

const menuActions = new Map<string | number, (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => void>([
  [ContextMenu.SendPageToAgent, sendPageToAgent],
  [ContextMenu.SendToAgent, sendToAgent],
]);

const registerMenu = () => {
  chrome.contextMenus.create(
    {
      id: ContextMenu.SendPageToAgent,
      title: 'Send page to agent',
      contexts: ['all']
    }
  );
  chrome.contextMenus.create({
    id: ContextMenu.SendToAgent,
    title: 'Send selection to agent',
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
