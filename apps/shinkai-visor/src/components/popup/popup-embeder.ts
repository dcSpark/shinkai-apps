import { generatePdfFromCurrentPage } from "../../helpers/pdf-generator";
import { srcUrlResolver } from "../../helpers/src-url-resolver";
import { ContentScriptMessageType } from "../../service-worker/communication/content-script-message-type";
import { ServiceWorkerMessageType } from "../../service-worker/communication/service-worker-message-type";
import { ServiceWorkerMessage } from "../../service-worker/communication/service-worker-messages";

const baseContainer = document.createElement('shinkai-popup-root');
baseContainer.style.position = 'fixed';
baseContainer.style.height = '600px';
baseContainer.style.width = '357px';
baseContainer.style.top = '120px';
baseContainer.style.right = '55px';
baseContainer.style.zIndex = '1500000000';
baseContainer.style.pointerEvents = 'none';
baseContainer.style.overflow = 'hidden';

const iframe = document.createElement('iframe');
iframe.setAttribute('src', chrome.runtime.getURL('src/components/popup/popup.html'));
iframe.style.border = 'none';
iframe.style.width = '100%';
iframe.style.height = '100%';

const shadow = baseContainer.attachShadow({ mode: 'open' });
shadow.appendChild(iframe);

const htmlRoot = document.getElementsByTagName('html')[0];
htmlRoot.prepend(baseContainer);

let isVisible = false;

chrome.runtime.onMessage.addListener(async (message: ServiceWorkerMessage, sender: chrome.runtime.MessageSender) => {
  if (message.type === ServiceWorkerMessageType.ContentScript) {
    if (message.data.type === ContentScriptMessageType.TogglePopupVisibility) {
      isVisible = message.data.data !== undefined ? message.data.data : !isVisible;
      baseContainer.style.pointerEvents = isVisible ? 'auto' : 'none';
    }
  } else if (message.type === ServiceWorkerMessageType.SendPageToAgent) {
    const pageAsPdf = await generatePdfFromCurrentPage(`${encodeURIComponent(window.location.href)}.pdf`, document.body);
    if (!pageAsPdf) {
      return;
    }
    message.data = {
      pdf: pageAsPdf,
    }
  }
  iframe.contentWindow?.postMessage({ message, sender }, srcUrlResolver('/'));
});
