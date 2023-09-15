import { Storage } from 'redux-persist';

type ChromeStorageType = 'local' | 'sync' | 'session';
export class ChromeStorage implements Storage {
  private storageType: ChromeStorageType = 'local';

  constructor(storage?: ChromeStorageType) {
    this.storageType = storage || 'local';
  }

  getItem(key: string, ...args: any[]) {
    return chrome.storage.local.get([key]).then((value) => value[key]);
  }
  setItem(key: string, value: any, ...args: any[]) {
    return chrome.storage.local.set({ [key]: value });
  }
  removeItem(key: string, ...args: any[]) {
    return chrome.storage.local.remove(key);
  }
}
