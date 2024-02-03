import { sendMessage } from './communication/internal';
import { ServiceWorkerInternalMessageType } from './communication/internal/types';

export enum ServiceWorkerShortcut {
  TogglePopup = 'toggle-popup',
}

const handleSidePanel = (tabId: number) => {
  sendMessage({ type: ServiceWorkerInternalMessageType.OpenSidePanel });
};
chrome.commands.onCommand.addListener((command, tab) => {
  console.log('command', command, tab);
  switch (command) {
    case ServiceWorkerShortcut.TogglePopup:
      if (!tab.id) {
        return;
      }
      handleSidePanel(tab.id);
      break;
    default:
      break;
  }
});
