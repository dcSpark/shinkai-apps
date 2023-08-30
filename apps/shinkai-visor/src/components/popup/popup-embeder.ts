import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { sendContentScriptMessage } from '../../service-worker/communication/internal';
import {
  ContentScriptBridgeMessageType,
  ServiceWorkerInternalMessage,
  ServiceWorkerInternalMessageType,
} from '../../service-worker/communication/internal/types';

const baseContainer = document.createElement('shinkai-popup-root');
baseContainer.style.position = 'fixed';
baseContainer.style.height = '640px';
baseContainer.style.width = '400px';
baseContainer.style.top = '80px';
baseContainer.style.right = '56px';
baseContainer.style.zIndex = '1500000000';
baseContainer.style.pointerEvents = 'none';
baseContainer.style.overflow = 'hidden';

const iframe = document.createElement('iframe');
iframe.setAttribute('id', 'popup-iframe');
iframe.setAttribute(
  'src',
  chrome.runtime.getURL('src/components/popup/popup.html'),
);
iframe.setAttribute('allow', 'clipboard-write');
iframe.style.border = 'none';
iframe.style.width = '100%';
iframe.style.height = '100%';
iframe.style.colorScheme = 'only light';

const shadow = baseContainer.attachShadow({ mode: 'open' });
shadow.appendChild(iframe);

const htmlRoot = document.getElementsByTagName('html')[0];
htmlRoot.prepend(baseContainer);

htmlRoot.addEventListener('keydown', function (ev) {
  if (ev.code === 'Escape') {
    sendContentScriptMessage({
      type: ContentScriptBridgeMessageType.TogglePopupVisibility,
      data: false,
    });
  }
});

let isVisible = false;

chrome.runtime.onMessage.addListener(
  async (
    message: ServiceWorkerInternalMessage,
    sender: chrome.runtime.MessageSender,
  ) => {
    switch (message.type) {
      case ServiceWorkerInternalMessageType.ContentScriptBridge:
        if (
          message.data.type ===
          ContentScriptBridgeMessageType.TogglePopupVisibility
        ) {
          isVisible =
            message.data.data !== undefined ? message.data.data : !isVisible;
          baseContainer.style.pointerEvents = isVisible ? 'auto' : 'none';
        }
        break;
      default:
        break;
    }
    iframe.contentWindow?.postMessage({ message, sender }, srcUrlResolver('/'));
  },
);
