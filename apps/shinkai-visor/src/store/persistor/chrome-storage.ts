import { PersistStorage, StorageValue } from "zustand/middleware";

type ChromeStorageType = keyof Pick<typeof chrome.storage, 'local' | 'session' | 'sync'>;

export class ChromeStorage<S> implements PersistStorage<S> {
  private storageType: ChromeStorageType = 'local';

  constructor(private storage: ChromeStorageType = 'local') {
    this.storageType = storage;
  }
  getItem(name: string): StorageValue<S> | null | Promise<StorageValue<S> | null> {
    return chrome.storage[this.storageType].get([name]).then((value) => value[name]);
  };
  setItem(name: string, value: StorageValue<S>): Promise<void> {
    return chrome.storage[this.storageType].set({ [name]: value });
  };
  removeItem(name: string): Promise<void> {
    return chrome.storage[this.storageType].remove(name);
  };
}
