import { ServiceWorkerMessageType } from "./communication/service-worker-message-type";
import { ServiceWorkerMessage } from "./communication/service-worker-messages";

enum ContextMenu {
  SaveToShinkaiNode = 'save-on-shinkai-node',
  SendToAgent = 'send-to-agent',
}

const saveToShinkaiNode = (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
  if (!tab?.id) {
    return;
  }
  chrome.pageCapture.saveAsMHTML(
    { tabId: tab?.id },
    (mhtml) => {
      console.log('saveToShinkaiNode - generated mhtml', mhtml);
    },
  )
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
  [ContextMenu.SaveToShinkaiNode, saveToShinkaiNode],
  [ContextMenu.SendToAgent, sendToAgent],
]);

const registerMenu = () => {
  chrome.contextMenus.create(
    {
      id: ContextMenu.SaveToShinkaiNode,
      title: 'Save this page in my Shinkai Node',
      contexts: ['all']
    }
  );
  chrome.contextMenus.create({
    id: ContextMenu.SendToAgent,
    title: 'Ask to agent',
    contexts: ['all']
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
