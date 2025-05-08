import { FileSystemService, NotificationService, PlatformService, StorageService } from '../interfaces';

/**
 * Web implementation of FileSystemService
 * Uses browser File System Access API where available, with fallbacks
 */
class WebFileSystemService implements FileSystemService {
  async openFile(): Promise<File> {
    if ('showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker();
        return await fileHandle.getFile();
      } catch (error) {
        throw new Error('Failed to open file');
      }
    } else {
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            resolve(file);
          } else {
            reject(new Error('No file selected'));
          }
        };
        input.click();
      });
    }
  }

  async saveFile(content: string, name: string): Promise<void> {
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: name,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      } catch (error) {
        throw new Error('Failed to save file');
      }
    } else {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async fileExists(path: string): Promise<boolean> {
    return false;
  }
}

/**
 * Web implementation of StorageService
 * Uses localStorage with JSON serialization
 */
class WebStorageService implements StorageService {
  async get<T>(key: string): Promise<T | null> {
    const value = localStorage.getItem(key);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Failed to parse stored value', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

/**
 * Web implementation of NotificationService
 * Uses browser Notification API
 */
class WebNotificationService implements NotificationService {
  async showNotification(title: string, body: string): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (!permission) {
        console.warn('Notification permission denied');
        return;
      }
    }

    new Notification(title, { body });
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }
}

/**
 * Web implementation of PlatformService
 * Provides access to all web-specific services
 */
export class WebPlatformService implements PlatformService {
  fileSystem: FileSystemService;
  storage: StorageService;
  notification: NotificationService;

  constructor() {
    this.fileSystem = new WebFileSystemService();
    this.storage = new WebStorageService();
    this.notification = new WebNotificationService();
  }

  isDesktop(): boolean {
    return false;
  }
}

export const platformService = new WebPlatformService();
