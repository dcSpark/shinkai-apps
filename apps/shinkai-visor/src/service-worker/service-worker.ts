import { actions, store } from './store';
import { configureStoreSw } from './sw-store/sw-side';

configureStoreSw(store, actions);

setInterval(() => {
  chrome.runtime.sendMessage('ping');
}, 5000);
