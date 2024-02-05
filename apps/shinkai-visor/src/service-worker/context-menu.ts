import { delay } from '../helpers/misc';
import { OPEN_SIDEPANEL_DELAY_MS, sendToAgent } from './action';

enum ContextMenu {
  SendToAgent = 'send-to-agent',
}

const menuActions = new Map<
  string | number,
  (
    info: chrome.contextMenus.OnClickData | undefined,
    tab: chrome.tabs.Tab | undefined,
  ) => void
>([[ContextMenu.SendToAgent, sendToAgent]]);
//
const registerMenu = () => {
  chrome.contextMenus.create({
    id: ContextMenu.SendToAgent,
    title: 'Send Selection to Shinkai Chat',
    contexts: ['selection'],
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
