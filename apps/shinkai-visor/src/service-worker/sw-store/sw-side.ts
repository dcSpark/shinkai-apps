import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';

import { DispatchAction, DispatchActionKey, StoreMessageType } from './types';

export const configureStoreSw = <T extends ToolkitStore>(
  store: T,
  actions: { [key: DispatchActionKey]: ReturnType<DispatchAction> }
): void => {
  chrome.runtime.onMessage.addListener(
    (message: StoreMessageType, sender, responseCallback) => {
      console.log('received message', message, sender);
      switch (message?.type) {
        case 'store':
          switch (message?.payload?.type) {
            case 'dispatch':
              store.dispatch(
                actions[message?.payload?.action](
                  ...(message?.payload?.payload || [])
                )
              );
              break;
            case 'current-store-value':
              responseCallback(store.getState());
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
    }
  );

  store.subscribe(() => {
    chrome.runtime.sendMessage<StoreMessageType>({
      type: 'store',
      payload: { type: 'store-changed', payload: store.getState() },
    });
  });
};
