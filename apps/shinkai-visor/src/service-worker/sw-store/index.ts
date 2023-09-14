import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import { useEffect, useState } from 'react';

import {
  DispatchAction,
  DispatchActionArguments,
  DispatchActionKey,
  StoreMessageType,
} from './types';

let currentStoreValue: any;

export const getCurrentStoreValue = <StoreType>(): Promise<StoreType> => {
  return new Promise<StoreType>((resolve) => {
    chrome.runtime.sendMessage<StoreMessageType>({ type: 'store', payload: { type: 'current-store-value' }}, (value) => {
      console.log('CURRENT STORE', value);
      resolve(value);
    });
  });
}

export const configureStoreSw = <T extends ToolkitStore>(
  store: T,
  actions: { [key: DispatchActionKey]: ReturnType<DispatchAction> },
): void => {
  chrome.runtime.onMessage.addListener(
    (message: StoreMessageType, sender, responseCallback) => {
      console.log('received message', message, sender);
      switch (message.type) {
        case 'store':
          switch (message.payload.type) {
            case 'dispatch':
              store.dispatch(
                actions[message.payload.action](...message.payload.payload)
              );
              break;
            case 'current-store-value':
              responseCallback(currentStoreValue);
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
    currentStoreValue = store.getState();
    chrome.runtime.sendMessage(currentStoreValue);
  });
};

export const dispatch = (action: DispatchActionKey, payload: DispatchActionArguments) => {
  chrome.runtime.sendMessage<StoreMessageType>({ type: 'store', payload: { type: 'dispatch', action, payload } });
};

export const useSelector = <StoreType, SelectorType>(
  selector: (store: StoreType) => SelectorType | undefined
): SelectorType | undefined => {
  const [selectedValue, setSelectedValue] = useState<SelectorType>();
  useEffect(() => {
    // Here we have a race, review it again
    getCurrentStoreValue<StoreType>().then((store) => {
      setSelectedValue(selector(store));
    });
    chrome.runtime.onMessage.addListener((message, sender, _) => {
      console.log('store changed', message, sender);
      setSelectedValue(selector(message));
    });
  }, [selector]);
  return selectedValue;
};
