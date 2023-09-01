import { Messaging } from '@dcspark/av-core';
import { SubscriptionRequestInterface } from '@urbit/http-api/dist/types';
import {
  EncryptedShipCredentials,
  AgrihanVisorAction,
  AgrihanVisorInternalAction,
  AgrihanVisorInternalComms,
  AgrihanVisorState,
  TabID,
  ExtensionID,
} from './types';

import { fetchAllPerms } from './agrihan';
import { useStore } from './store';
import { EventEmitter } from 'events';
const ob = require('urbit-ob');

export const Pusher = new EventEmitter();

async function init() {
  const state = useStore.getState();
  await state.init();
  // listen to changes in popup preference in storage
  storageListener();
  messageListener();
  extensionListener();
  hotkeyListener();
}
init();

function storageListener() {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    const state = useStore.getState();
    if (changes.popup) state.changePopupPreference(changes.popup.newValue);
    if (changes.permissions) state.loadPerms(changes.permissions.newValue);
    if (changes.ships) {
      if (
        state.activeShip &&
        deletedWasActive(state.activeShip, changes.ships.newValue, changes.ships.oldValue)
      ) {
        state.disconnectShip();
      }
      state.init().then(res => console.log(''));
    }
  });
}

function deletedWasActive(
  activeShip: EncryptedShipCredentials,
  newShips: EncryptedShipCredentials[],
  oldShips: EncryptedShipCredentials[]
) {
  if (newShips.length < oldShips.length) {
    const deletedShip = oldShips.find(
      ship => !newShips.map(newships => newships.shipName).includes(ship.shipName)
    );
    if (activeShip.shipName == deletedShip.shipName) return true;
    else return false;
  } else return false;
}

function messageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.app == 'agrihan-visor-internal')
      handleInternalMessage(request, sender, sendResponse);
    else if (
      sender.url == 'chrome-extension://oadimaacghcacmfipakhadejgalcaepg/launcher.html' &&
      request.app !== 'command-launcher'
    )
      handleVisorCall(request, sender, sendResponse, 'extension');
    else if (request.app == 'agrihanVisor')
      handleVisorCall(request, sender, sendResponse, 'website');
    else if (request.app == 'command-launcher')
      handleCommandLauncherCall(request, sender, sendResponse);
    else sendResponse('ng');
    return true;
  });
}
function extensionListener() {
  chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    /* check whitelist here against sender.id */
    handleVisorCall(request, sender, sendResponse, 'extension');
  });
}
function hotkeyListener() {
  const showPopup = () => {
    const background = document.getElementById('agrihan-visor-modal-bg');
    if (background) {
      background.style.display = 'block';
      background.style.opacity = '0.9';
      const modalText = document.getElementById('agrihan-visor-modal-text');
      if (modalText) modalText.innerText = 'Connect to a ship with your Agrihan Visor';
      setTimeout(() => (background.style.display = 'none'), 3000);
    }
  };
  const showLauncher = () => {
    const modal: any = <any>(
      document.querySelector('html > div').shadowRoot.querySelector('#command-launcher-container')
    );
    modal.showModal();
    modal.firstElementChild.contentWindow.postMessage('focus', '*');
  };
  chrome.commands.onCommand.addListener((command, tab) => {
    const state = useStore.getState();

    chrome.tabs.executeScript(tab.id, {
      code: `(${showLauncher})()`,
    });
  });
}

function handleCommandLauncherCall(request: any, sender: any, sendResponse: any) {
  switch (request.action) {
    case 'route':
      let tabIdd: number;
      chrome.tabs.create(
        {
          url: request.data.url,
        },
        tab => {
          tabIdd = tab.id;
          console.log(tabIdd);
        }
      );
      sendResponse('ok');
      break;
    case 'open':
      const showLauncher = () => {
        const modal: any = <any>(
          document
            .querySelector('html > div')
            .shadowRoot.querySelector('#command-launcher-container')
        );
        modal.showModal();
        modal.firstElementChild.contentWindow.postMessage('focus', '*');
      };
      chrome.tabs.executeScript({
        code: `(${showLauncher})()`,
      });
      sendResponse('ok');
      break;
  }
}

function handleInternalMessage(request: AgrihanVisorInternalComms, sender: any, sendResponse: any) {
  const state = useStore.getState();
  let recipients: Set<number | string>;
  const tabs = new Set(state.consumer_tabs.map(consumer => consumer.tab));
  const extensions = new Set(state.consumer_extensions.map(consumer => consumer.id));
  const extension_tabs = new Set(state.consumer_extensions.map(consumer => consumer.tabs).flat());
  recipients = new Set([...tabs, ...extensions, ...extension_tabs]);

  switch (request.action) {
    case 'get_initial_state':
      sendResponse({
        first: state.first,
        ships: state.ships,
        activeShip: state.activeShip,
        cachedURL: state.cached_url,
        cachedCreds: state.cached_creds,
        requestedPerms: state.requestedPerms,
      });
      break;
    case 'get_ships':
      sendResponse({ airlock: state.airlock, ships: state.ships, active: state.activeShip });
      break;
    case 'call_airlock':
      if (state.airlock)
        (state.airlock as any)
          [request.data.action](request.data.argument)
          .then((res: any) => sendResponse(res))
          .catch((err: any) => sendResponse({ status: 'error', response: err }));
      break;
    case 'get_selected':
      sendResponse({ selected: state.selectedShip, active: state.activeShip });
      break;
    case 'get_cached_url':
      sendResponse({ cached_url: state.cached_url, cached_creds: state.cached_creds });
      break;
    case 'get_perms':
      sendResponse({ selectedShip: state.selectedShip });
      break;
    case 'get_settings':
      sendResponse({ popupPreference: state.popupPreference });
      break;
    case 'get_command_history':
      sendResponse({ commandHistory: state.commandHistory });
      break;
    case 'set_master_password':
      state.setMasterPassword(request.data.password).then(res => sendResponse('ok'));
      break;
    case 'add_ship':
      state
        .addShip(request.data.ship, request.data.url, request.data.code, request.data.pw)
        .then(res => sendResponse('ok'));
      break;
    case 'remove_ship':
      state.removeShip(request.data.ship).then(res => sendResponse('ok'));
      break;
    case 'select_ship':
      state.selectShip(request.data.ship);
      sendResponse('ok');
      break;
    case 'connect_ship':
      if (state.activeShip) {
        state.disconnectShip();
        Messaging.pushEvent(
          { action: 'disconnected', data: { ship: state.activeShip.shipName } },
          recipients
        );
      }
      state
        .connectShip(request.data.url, request.data.ship)
        .then(res => {
          chrome.browserAction.setBadgeText({ text: '' });
          Messaging.pushEvent({ action: 'connected' }, recipients);
          sendResponse('ok');
        })
        .catch(err => sendResponse(null));
      break;
    case 'get_data':
      state.airlock.subscribe({
        app: 'graph-store',
        path: '/keys',
        event: data => {
          sendResponse(data);
        },
      });
      break;
    case 'disconnect_ship':
      state.disconnectShip();
      Messaging.pushEvent({ action: 'disconnected' }, recipients);
      sendResponse('ok');
      break;
    case 'grant_perms':
      state.grantPerms(request.data.request).then(res => {
        chrome.browserAction.setBadgeText({ text: '' });
        const tbs = new Set(
          state.consumer_tabs
            .filter(tab => tab.url.origin === request.data.request.key)
            .map(tab => tab.tab)
        );
        const xtns = new Set(
          state.consumer_extensions
            .filter(ext => ext.id === request.data.request.key)
            .map(ext => ext.id)
        );
        const xtns_tabs = new Set(
          state.consumer_extensions
            .filter(ext => ext.id === request.data.request.key)
            .map(ext => ext.tabs)
            .flat()
        );
        recipients = new Set([...tbs, ...xtns, ...xtns_tabs]);
        Messaging.pushEvent(
          { action: 'permissions_granted', data: request.data.request },
          recipients
        );
        sendResponse('ok');
      });
      break;
    case 'deny_perms':
      state.denyPerms();
      chrome.browserAction.setBadgeText({ text: '' });
      sendResponse('ok');
      break;
    case 'remove_whole_domain':
      state
        .removeWholeDomain(request.data.url, request.data.ship, request.data.domain)
        .then(res => {
          const tbs = new Set(
            state.consumer_tabs
              .filter(tab => tab.url.origin === request.data.domain)
              .map(tab => tab.tab)
          );
          const xtns = new Set(
            state.consumer_extensions
              .filter(ext => ext.id === request.data.domain)
              .map(ext => ext.id)
          );
          const xtns_tabs = new Set(
            state.consumer_extensions
              .filter(ext => ext.id === request.data.domain)
              .map(ext => ext.tabs)
              .flat()
          );
          recipients = new Set([...tbs, ...xtns, ...xtns_tabs]);
          Messaging.pushEvent({ action: 'permissions_revoked', data: request.data }, recipients);
          sendResponse('ok');
        });
      break;
    case 'revoke_perm':
      state.revokePerm(request.data.url, request.data.ship, request.data.request).then(res => {
        const tbs = new Set(
          state.consumer_tabs
            .filter(tab => tab.url.origin === request.data.request.key)
            .map(tab => tab.tab)
        );
        const xtns = new Set(
          state.consumer_extensions
            .filter(ext => ext.id === request.data.request.key)
            .map(ext => ext.id)
        );
        const xtns_tabs = new Set(
          state.consumer_extensions
            .filter(ext => ext.id === request.data.request.key)
            .map(ext => ext.tabs)
            .flat()
        );
        recipients = new Set([...tbs, ...xtns, ...xtns_tabs]);
        Messaging.pushEvent(
          { action: 'permissions_revoked', data: request.data.request },
          recipients
        );
        sendResponse('ok');
      });
      break;
    case 'change_popup_preference':
      state.changePopupPreference(request.data.preference).then(res => sendResponse('ok'));
      break;
    case 'change_master_password':
      state
        .changeMasterPassword(request.data.oldPw, request.data.newPw)
        .then(res => sendResponse('ok'));
      break;
    case 'reset_app':
      state.resetApp().then(res => sendResponse('ok'));
      break;
    case 'connect_to_ship':
      state.connectShip(request.data.url, request.data.ship).then(res => {
        chrome.browserAction.setBadgeText({ text: '' });
        sendResponse('ok');
      });
      break;
    case 'cache_form_url':
      state.cacheURL(request.data.url);
      sendResponse('ok');
      break;
    case 'cache_form_creds':
      state.cacheCreds(request.data.creds);
      sendResponse('ok');
      break;
    case 'store_command_history':
      state.storeCommandHistory(request.data);
      sendResponse('ok');
      break;
    case 'active_subscriptions':
      sendResponse(state.activeSubscriptions);
      break;
    case 'current_tab':
      chrome.tabs.getCurrent(tab => sendResponse(tab.id));
      break;
    case 'remove_subscription':
      const sub = state.activeSubscriptions.find(
        sub => sub.subscriber === request.data && sub.subscription.app === 'herm'
      );
      state.removeSubscription(sub);
      sendResponse(sub);
      break;
  }
}
type visorCallType = 'website' | 'extension';

function handleVisorCall(request: any, sender: any, sendResponse: any, callType: visorCallType) {
  const state = useStore.getState();
  const tabID = sender.tab ? [sender.tab.id] : [];
  if (callType !== 'website')
    state.addConsumerExtension({
      tabs: tabID,
      id: sender.id,
      name: request?.data?.consumerName || '',
    });
  else state.addConsumerTab({ tab: sender.tab.id, url: new URL(sender.tab.url) });
  if (request.action == 'register_name') sendResponse({ status: 'ok' });
  else if (request.action == 'check_connection')
    sendResponse({ status: 'ok', response: !!state.activeShip });
  else if (request.action == 'unsubscribe') unsubscribe(state, request, sender, sendResponse);
  else if (request.action == 'run_auth') runAuth(state, request.data, sendResponse);
  else if (!state.activeShip) notifyUser(state, 'locked', sendResponse);
  else checkPerms(state, callType, request, sender, sendResponse);
}

async function runAuth(state: AgrihanVisorState, backendShip: string, sendResponse: any) {
  const airlock = state.airlock;
  const pok = await airlock.poke({
    app: 'dm-hook',
    mark: 'dm-hook-action',
    json: {
      accept: '~' + backendShip,
    },
  });
  const decp = ob
    .patp2dec('~' + backendShip)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  try {
    const scry = await airlock.scry({
      app: 'graph-store',
      path: `/graph/${'~' + airlock.ship}/dm-inbox/node/siblings/newest/lone/1/${decp}`,
    });
    const nodes = scry['graph-update']['add-nodes']['nodes'];
    const node = nodes[Object.keys(nodes)[0]];
    const code = node.post.contents[0].text.split('\n ')[1];
    sendResponse({ status: 'ok', response: code });
  } catch {
    sendResponse({
      status: 'ng',
      response: 'Failed to scry the auth code. Make sure you passed the right ship name.',
    });
  }
}

function openWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    focused: true,
    height: 900,
    width: 600,
  });
}
type Lock = 'locked' | 'noperms';

function notifyUser(state: AgrihanVisorState, type: Lock, sendResponse: any) {
  if (state.popupPreference == 'window') {
    openWindow();
    sendResponse('ng');
  } else {
    chrome.browserAction.setBadgeText({ text: '1' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' });
    sendResponse({ status: type, response: null });
  }
}

function checkPerms(
  state: AgrihanVisorState,
  callType: visorCallType,
  request: any,
  sender: any,
  sendResponse: any
) {
  console.log(callType, 'calltype');
  const id: string = callType === 'extension' ? sender.id : sender.origin;
  const recipient = sender.tab ? sender.tab.id : sender.id;
  const extension = state.consumer_extensions.find(sumer => sumer.id === id);
  const name = extension ? extension.name : '';
  const existingPerms = state.permissions[id] || [];
  if (request.action === 'check_perms') sendResponse({ status: 'ok', response: existingPerms });
  else if (request.action === 'perms')
    bulkRequest(state, id, name, existingPerms, request, sender, sendResponse);
  else if (!existingPerms || !existingPerms.includes(request.action)) {
    state.requestPerms({
      key: id,
      name: name,
      permissions: [request.action],
      existing: existingPerms,
    });
    notifyUser(state, 'noperms', sendResponse);
  } else {
    if (request.action == 'poke' || request.action == 'subscribe')
      pubsub(state, callType, recipient, request, sender, sendResponse);
    else reqres(state, request, sendResponse);
  }
}

function bulkRequest(
  state: AgrihanVisorState,
  requester: string,
  name: string,
  existingPerms: any,
  request: any,
  sender: any,
  sendResponse: any
) {
  if (existingPerms && request.data.every((el: AgrihanVisorAction) => existingPerms.includes(el)))
    sendResponse('perms_exist');
  else {
    state.requestPerms({
      key: requester,
      name: name,
      permissions: request.data,
      existing: existingPerms,
    });
    notifyUser(state, 'noperms', sendResponse);
  }
}

function unsubscribe(state: AgrihanVisorState, request: any, sender: any, sendResponse: any) {
  state.airlock
    .unsubscribe(request.data)
    .then(res => {
      const sub = state.activeSubscriptions.find(
        sub => sub.airlockID === request.data && sub.subscriber === sender.tab.id
      );
      state.removeSubscription(sub);
      sendResponse({ status: 'ok', response: `unsubscribed to ${request.data}` });
    })
    .catch(err => sendResponse({ status: 'error', response: err }));
}

function reqres(state: AgrihanVisorState, request: any, sendResponse: any): void {
  switch (request.action) {
    case 'perms':
      sendResponse({ status: 'ok', response: 'perms_exist' });
      break;
    case 'shipName':
      sendResponse({ status: 'ok', response: state.activeShip.shipName });
      break;
    case 'shipURL':
      sendResponse({ status: 'ok', response: state.airlock });
      break;
    case 'scry':
      state.airlock
        .scry(request.data)
        .then(res => sendResponse({ status: 'ok', response: res }))
        .catch(err => sendResponse({ status: 'error', response: err }));
      break;
    case 'thread':
      state.airlock
        .thread(request.data)
        .then(res => sendResponse({ status: 'ok', response: res }))
        .catch(err => sendResponse({ status: 'error', response: err }));
      break;
    default:
      sendResponse({ status: 'error', response: 'invalid_request' });
      break;
  }
}

function pubsub(
  state: AgrihanVisorState,
  callType: visorCallType,
  eventRecipient: TabID | ExtensionID,
  request: any,
  sender: any,
  sendResponse: any
): void {
  switch (request.action) {
    case 'poke':
      const pokePayload = Object.assign(request.data, {
        onSuccess: () => handlePokeSuccess(request.data, eventRecipient, request.id),
        onError: (e: any) => handlePokeError(e, request.data, eventRecipient, request.id),
      });
      state.airlock
        .poke(pokePayload)
        .then(res => sendResponse({ status: 'ok', response: res }))
        .catch(err => sendResponse({ status: 'error', response: err }));
      break;
    case 'subscribe':
      const existing = state.activeSubscriptions.find(sub => {
        return (
          sub.subscription.app == request.data.payload.app &&
          sub.subscription.path == request.data.payload.path
        );
      });
      if (!existing) {
        const payload = Object.assign(request.data.payload, {
          event: (event: any) => handleEvent(event, request.data.payload, request.id),
          err: (error: any) =>
            handleSubscriptionError(error, request.data, eventRecipient, request.id),
        });
        state.airlock
          .subscribe(payload)
          .then(res => {
            state.addSubscription({
              subscription: request.data.payload,
              subscriber: eventRecipient,
              airlockID: res,
              requestID: request.id,
            });
            sendResponse({ status: 'ok', response: res, subscriber: eventRecipient });
          })
          .catch(err => sendResponse({ status: 'error', response: err }));
      } else if (existing.subscriber !== eventRecipient) {
        state.addSubscription({
          subscription: request.data.payload,
          subscriber: eventRecipient,
          airlockID: existing.airlockID,
          requestID: request.id,
        });
        sendResponse({ status: 'ok', response: 'piggyback', subscriber: eventRecipient });
      } else sendResponse({ status: 'ok', response: 'noop' });
      break;
  }
}

function handlePokeSuccess(poke: any, id: number | string, requestID: string) {
  Messaging.pushEvent({ action: 'poke_success', data: poke, requestID: requestID }, new Set([id]));
}

function handleEvent(event: any, subscription: SubscriptionRequestInterface, requestID: string) {
  setTimeout(() => {
    const state = useStore.getState();
    const recipients = state.activeSubscriptions
      .filter(
        sub =>
          sub.subscription.app === subscription.app && sub.subscription.path === subscription.path
      )
      .map(sub => sub.subscriber);
    Messaging.pushEvent({ action: 'sse', data: event, requestID: requestID }, new Set(recipients));
  }, 2000);
}
function handlePokeError(error: any, poke: any, id: number | string, requestID: string) {
  Messaging.pushEvent({ action: 'poke_error', data: poke, requestID: requestID }, new Set([id]));
}
function handleSubscriptionError(
  error: any,
  subscription: any,
  id: number | string,
  requestID: string
) {
  Messaging.pushEvent(
    { action: 'subscription_error', data: subscription, requestID: requestID },
    new Set([id])
  );
}
