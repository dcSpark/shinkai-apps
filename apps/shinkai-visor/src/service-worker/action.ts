import { ContentScriptMessageType } from "./communication/content-script-message-type";
import { sendContentScriptMessage } from "./communication/content-script-messages";

chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) {
    return;
  }
  sendContentScriptMessage({ type: ContentScriptMessageType.TogglePopupVisibility }, tab?.id);
});
