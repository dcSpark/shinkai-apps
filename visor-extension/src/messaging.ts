import {
  ShinkaiVisorRequest,
  CommandLauncherRequest,
  ShinkaiVisorEvent,
  ShinkaiVisorResponse,
  ShinkaiVisorState,
  ShinkaiVisorInternalComms,
} from './types';

const Messaging = {
  sendToPopup: async function (message: { state: ShinkaiVisorState }): Promise<void> {
    return new Promise((res, rej) =>
      chrome.runtime.sendMessage(message, response => res(response))
    );
  },
  sendToBackground: async function (request: ShinkaiVisorInternalComms): Promise<any> {
    return new Promise((res, rej) =>
      chrome.runtime.sendMessage(
        {
          ...request,
          app: 'shinkai-visor-internal',
        },
        response => res(response)
      )
    );
  },
  relayToBackground: async function (
    request: ShinkaiVisorRequest | CommandLauncherRequest
  ): Promise<ShinkaiVisorResponse> {
    return new Promise((res, rej) =>
      chrome.runtime.sendMessage(request, response => res(response))
    );
  },
  pushEvent: function (event: ShinkaiVisorEvent, recipients: Set<any>) {
    for (let id of recipients) {
      if (typeof id == 'number')
        chrome.tabs.sendMessage(id, { app: 'shinkaiVisorEvent', event: event });
      if (typeof id == 'string')
        chrome.runtime.sendMessage(id, { app: 'shinkaiVisorEvent', event: event });
    }
  },
  callVisor: function ({ app, action, data }: ShinkaiVisorRequest): Promise<ShinkaiVisorResponse> {
    return new Promise((res, rej) => {
      const requestId = Math.random().toString(36).substr(2, 9);
      // first add listener for the eventual response
      window.addEventListener('message', function responseHandler(e) {
        const response = e.data;
        // ignore messages with the wrong request app name, wrong id, or null
        if (response.app !== 'shinkaiVisorResponse' || response.id !== requestId) return;
        // remove listener else they keep stacking up
        window.removeEventListener('message', responseHandler);
        // reject promise if there's an error
        if (response.error) rej(response.error);
        // resolve if fine
        else res(response);
      });
      window.postMessage({ action, data, app, id: requestId }, window.origin);
    });
  },
  createProxyController: () => {
    console.log('Shinkai Visor present');
    //listen to function calls from webpage
    window.addEventListener('message', async function (e) {
      const request = e.data;
      if (request && request.app !== 'shinkaiVisor') return;
      // relay message to background script
      request.origin = e.origin;
      Messaging.relayToBackground(request).then((response: ShinkaiVisorResponse) => {
        // relay back responses to webpage
        window.postMessage(
          {
            app: 'shinkaiVisorResponse',
            id: request.id,
            status: response?.status,
            response: response?.response,
          },
          window.origin
        );
      });
      return;
    });
    // listen to events from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // relay events to webpage
      if (request.app == 'shinkaiVisorEvent') {
        window.postMessage(request, window.origin);
        sendResponse('ok');
      } else sendResponse('ng');
      return true;
    });
  },
};

export { Messaging };
