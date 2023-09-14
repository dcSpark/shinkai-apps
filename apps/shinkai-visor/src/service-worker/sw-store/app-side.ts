import { useEffect, useState } from 'react';

import {
  DispatchActionArguments,
  DispatchActionKey,
  StoreMessageType,
} from './types';

export const dispatch = (
  action: DispatchActionKey,
  payload: DispatchActionArguments
) => {
  chrome.runtime.sendMessage<StoreMessageType>({
    type: 'store',
    payload: { type: 'dispatch', action, payload },
  });
};

export const useSelector = <StoreType, SelectorType>(
  selector: (store: StoreType) => SelectorType | undefined
): SelectorType | undefined => {
  const [selectedValue, setSelectedValue] = useState<SelectorType>();
  useEffect(() => {
    getCurrentStoreValue<StoreType>()
      .then(async (store) => {
        // TODO: Remove me
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
        setSelectedValue(selector(store));
      })
      .finally(() => {
        console.log('SUBSCRIBED');
        chrome.runtime.onMessage.addListener((message: StoreMessageType, sender, _) => {
          if (message?.type === 'store' && message?.payload?.type === 'store-changed') {
            console.log('store changed', message, sender);
            setSelectedValue(selector(message?.payload?.payload));
          }
        });
      });
  }, [selector]);
  return selectedValue;
};

export const getCurrentStoreValue = <StoreType>(): Promise<StoreType> => {
  return new Promise<StoreType>((resolve) => {
    chrome.runtime.sendMessage<StoreMessageType>(
      { type: 'store', payload: { type: 'current-store-value' } },
      (value) => {
        console.log('CURRENT STORE', value);
        resolve(value);
      }
    );
  });
};
