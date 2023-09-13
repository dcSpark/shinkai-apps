import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import { useEffect, useState } from 'react';

import {
  DispatchAction,
  DispatchActionKey,
  ServiceWorkerMessageType,
  StoreProcessorPayload,
} from './types';

export const configureStoreSw = <T extends ToolkitStore>(
  store: T,
  actions: { [key: DispatchActionKey]: ReturnType<DispatchAction> }
): void => {
  chrome.runtime.onMessage.addListener(
    (message: ServiceWorkerMessageType, sender, _) => {
      console.log('received message', message, sender);
      switch (message.type) {
        case 'store':
          switch (message.payload.type) {
            case 'dispatch':
              store.dispatch(
                actions[message.payload.action](...message.payload.payload)
              );
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
    chrome.runtime.sendMessage(store.getState());
  });
};

export const dispatchSw = (message: StoreProcessorPayload) => {
  chrome.runtime.sendMessage({ type: 'store', payload: message });
};

export const useSelectorSw = <T, S>(
  selector: (store: T) => S
): S | undefined => {
  const [selectedValue, setSelectedValue] = useState<S | undefined>(undefined);
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, _) => {
      console.log('store changed', message, sender);
      setSelectedValue(selector(message));
    });
  }, [selector]);
  return selectedValue;
};
