import { delay } from '@shinkai_network/shinkai-ui/helpers';

import {
  OPEN_SIDEPANEL_DELAY_MS,
  sendCaptureToAgent,
  sendPageToAgent,
  sendToAgent,
  summarizePage,
} from './action';

enum ContextMenu {
  SendPageToAgent = 'send-page-to-agent',
  SendToAgent = 'send-to-agent',
  SendCaptureToAgent = 'send-capture-to-agent',
  SummarizePage = 'summarize-page',
}

const menuActions = new Map<
  string | number,
  (
    info: chrome.contextMenus.OnClickData,
    tab: chrome.tabs.Tab | undefined,
  ) => void
>([
  [ContextMenu.SendPageToAgent, sendPageToAgent],
  [ContextMenu.SendToAgent, sendToAgent],
  [ContextMenu.SendCaptureToAgent, sendCaptureToAgent],
  [ContextMenu.SummarizePage, summarizePage],
]);
const registerMenu = () => {
  chrome.contextMenus.create({
    id: ContextMenu.SummarizePage,
    title: 'Summarize This Page',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: 'separator',
    type: 'separator',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: ContextMenu.SendPageToAgent,
    title: 'Send Page to AI',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: ContextMenu.SendToAgent,
    title: 'Send Selection to AI',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: ContextMenu.SendCaptureToAgent,
    title: 'Send Capture to AI',
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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;
  const action = menuActions.get(info.menuItemId);
  if (!action) return;
  await chrome.sidePanel.open({ windowId: tab.windowId });
  // wait for side panel to open
  await delay(OPEN_SIDEPANEL_DELAY_MS);
  action(info, tab);
});
