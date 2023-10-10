import { ContentScriptMessageType } from "./communication/content-script-message-type";
import { sendContentScriptMessage } from "./communication/content-script-messages";

export enum ServiceWorkerShortcut {
  TogglePopup = 'toggle-popup'
};

const handleTogglePopup = (tabId: number) => {
  sendContentScriptMessage({ type: ContentScriptMessageType.TogglePopupVisibility }, tabId);
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
