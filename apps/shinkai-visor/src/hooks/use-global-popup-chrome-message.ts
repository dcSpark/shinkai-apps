import { useState } from "react";
import { useHistory } from "react-router-dom";

import { generatePdfFromCurrentPage } from '../helpers/pdf-generator';
import { ContentScriptMessageType } from "../service-worker/communication/content-script-message-type";
import { sendContentScriptMessage } from '../service-worker/communication/content-script-messages';
import { ServiceWorkerMessageType } from "../service-worker/communication/service-worker-message-type";
import { useChromeMessage } from "./use-chrome-message";

export const useGlobalPopupChromeMessage = () => {
  const history = useHistory();
  const [popupVisibility, setPopupVisibility] = useState(false);
  useChromeMessage(async (message, sender) => {
    if (message.type === ServiceWorkerMessageType.SendToAgent) {
      const params = new URLSearchParams({ context: message?.data?.textContent });
      history.replace({ pathname: '/inboxes/create-job', search: params.toString() });
      sendContentScriptMessage({ type: ContentScriptMessageType.TogglePopupVisibility, data: true });
    } else if (message.type === ServiceWorkerMessageType.SendPageToAgent) {
        const pageAsPdf = await generatePdfFromCurrentPage(`${encodeURIComponent(window.location.href)}.pdf`);
        if (!pageAsPdf) {
          return;
        }
        history.replace({ pathname: '/inboxes/create-job', state: { files: [pageAsPdf]} });
        sendContentScriptMessage({ type: ContentScriptMessageType.TogglePopupVisibility, data: true });

    } else if (message.type === ServiceWorkerMessageType.ContentScript) {
      if (message.data.type === ContentScriptMessageType.TogglePopupVisibility) {
        setPopupVisibility(message.data.data !== undefined ? message.data.data : !popupVisibility);
      }
    }
  });
  return [popupVisibility];
};
