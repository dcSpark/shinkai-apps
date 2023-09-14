import { Storage } from 'redux-persist';

type ChromeStorageType = 'local' | 'sync' | 'session';
export class ChromeStorage implements Storage {
  private storageType: ChromeStorageType = 'local';

  constructor(storage?: ChromeStorageType) {
    this.storageType = storage || 'local';
  }

  getItem(key: string, ...args: any[]) {
    console.log('GET CHROME STORAGEEEEEEEEE', key);
    return chrome.storage.local.get([key]);
  }
  setItem(key: string, value: any, ...args: any[]) {
    console.log('SET CHROME STORAGEEEEEEEEE', key, value);
    return chrome.storage.local.set({ key: key, value });
  }
  removeItem(key: string, ...args: any[]) {
    console.log('REMOVE CHROME STORAGEEEEEEEEE', key);
    return chrome.storage.local.remove(key);
  }
}
