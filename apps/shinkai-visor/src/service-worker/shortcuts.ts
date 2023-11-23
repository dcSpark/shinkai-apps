import { sendContentScriptMessage } from "./communication/internal";
import { ContentScriptBridgeMessageType } from "./communication/internal/types";

export enum ServiceWorkerShortcut {
  TogglePopup = 'toggle-popup'
};

const handleTogglePopup = (tabId: number) => {
  sendContentScriptMessage({ type: ContentScriptBridgeMessageType.TogglePopupVisibility }, tabId);
}
chrome.commands.onCommand.addListener((command, tab) => {
  console.log('command', command, tab);
  switch (command) {
    case ServiceWorkerShortcut.TogglePopup:
      if (!tab.id) {
        return;
      }
      handleTogglePopup(tab.id);
      break;
    default:
      break;
  }
});
