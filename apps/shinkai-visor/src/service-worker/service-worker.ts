import './service-worker-store-processor';

import axios from 'axios';
import { getAdapter } from 'axios'

import { serviceWorkerStoreProcessor } from './service-worker-store-processor';
import { ServiceWorkerMessageType } from './service-worker-types';

axios.defaults.adapter = [getAdapter('http')];

chrome.runtime.onMessage.addListener(
  (message: ServiceWorkerMessageType, sender, _) => {
    console.log('received message', message, sender);
    switch (message.type) {
      case 'store':
        serviceWorkerStoreProcessor.process(message.payload);
        break;
      default:
        console.log(`unknown message type ${message}`);
    }
  }
);
