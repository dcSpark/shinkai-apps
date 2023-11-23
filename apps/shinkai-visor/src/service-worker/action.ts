import { sendContentScriptMessage } from "./communication/internal";
import { ContentScriptBridgeMessageType } from "./communication/internal/types";

const isChromeInternalUrl = (urlString: string): boolean => {
  const url = new URL(urlString);
  return url.protocol === 'chrome:';
}

const setDefaultPopup = (tabId: number, url: string): Promise<void> => {
  if (!url || isChromeInternalUrl(url)) {
    console.log('setting the default popup');
    return chrome.action.setPopup({ popup: 'src/components/installed-popup/installed-popup.html', tabId });
  } else {
    console.log('setting undefined default popup');
    return chrome.action.setPopup({ popup: '', tabId });
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  console.log('actions.onClicked', tab?.id);
  if (!tab?.id) {
    return;
  }
  sendContentScriptMessage({ type: ContentScriptBridgeMessageType.TogglePopupVisibility }, tab.id);
});

chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
  console.log('tabs.onUpdated', tabId);
  setDefaultPopup(tabId, tab.url || '');
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  console.log('tabs.onActivated', tab.id, tab.url);
  setDefaultPopup(activeInfo.tabId, tab.url || '');
});
