// const setDefaultPopup = (tabId: number, url: string): Promise<void> => {
//   if (!url || isChromeInternalUrl(url)) {
//     console.log('setting the default popup');
//     return chrome.action.setPopup({
//       popup: 'src/components/installed-popup/installed-popup.html',
//       tabId,
//     });
//   } else {
//     console.log('setting undefined default popup');
//     return chrome.action.setPopup({ popup: '', tabId });
//   }
// };

export const openSidePanel = async (tab: chrome.tabs.Tab | undefined) => {
  if (!tab) return;
  await chrome.sidePanel.open({ windowId: tab.windowId }).then((res) => {
    console.log('sidePanel.open', res);
  });
};

// chrome.action.onClicked.addListener(async (tab) => {
//   console.log('actions.onClicked', tab?.id);
//   if (!tab?.id) {
//     return;
//   }
//   openSidePanel(tab);
// });

// chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
//   console.log('tabs.onUpdated', tabId);
//   setDefaultPopup(tabId, tab.url || '');
// });
//
// chrome.tabs.onActivated.addListener(async (activeInfo) => {
//   const tab = await chrome.tabs.get(activeInfo.tabId);
//   console.log('tabs.onActivated', tab.id, tab.url);
//   setDefaultPopup(activeInfo.tabId, tab.url || '');
// });
