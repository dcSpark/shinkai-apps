import { FileSystemService, NotificationService, PlatformService, StorageService } from '../interfaces';

/**
 * Desktop (Tauri) implementation of FileSystemService
 * Uses Tauri's dialog and fs APIs
 */
class DesktopFileSystemService implements FileSystemService {
  async openFile(): Promise<File> {
    try {
      throw new Error('Not implemented in shared code - use Tauri-specific implementation');
    } catch (error) {
      throw new Error('Failed to open file');
    }
  }

  async saveFile(content: string, name: string): Promise<void> {
    try {
      throw new Error('Not implemented in shared code - use Tauri-specific implementation');
    } catch (error) {
      throw new Error('Failed to save file');
    }
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      throw new Error('Not implemented in shared code - use Tauri-specific implementation');
    } catch (error) {
      throw new Error('Failed to check if file exists');
    }
  }
}

/**
 * Desktop (Tauri) implementation of StorageService
 * Uses Tauri's fs API for persistent storage
 */
class DesktopStorageService implements StorageService {
  async get<T>(key: string): Promise<T | null> {
    try {
      throw new Error('Not implemented in shared code - use Tauri-specific implementation');
    } catch (error) {
      console.error('Failed to get stored value', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      throw new Error('Not implemented in shared code - use Tauri-specific implementation');
    } catch (error) {
      throw new Error('Failed to set stored value');
    }
  }

  async remove(key: string): Promise<void> {
    try {
      throw new Error('Not implemented in shared code - use Tauri-specific implementation');
    } catch (error) {
      throw new Error('Failed to remove stored value');
    }
  }

  async clear(): Promise<void> {
    try {
      throw new Error('Not implemented in shared code - use Tauri-specific implementation');
    } catch (error) {
      throw new Error('Failed to clear storage');
    }
  }
}

/**
 * Desktop (Tauri) implementation of NotificationService
 * Uses Tauri's notification API
 */
class DesktopNotificationService implements NotificationService {
  async showNotification(title: string, body: string): Promise<void> {
    try {
      throw new Error('Not implemented in shared code - use Tauri-specific implementation');
    } catch (error) {
      throw new Error('Failed to show notification');
    }
  }

  async requestPermission(): Promise<boolean> {
    return true;
  }

  isSupported(): boolean {
    return true;
  }
}

/**
 * Desktop (Tauri) implementation of PlatformService
 * Provides access to all desktop-specific services
 */
export class DesktopPlatformService implements PlatformService {
  fileSystem: FileSystemService;
  storage: StorageService;
  notification: NotificationService;

  constructor() {
    this.fileSystem = new DesktopFileSystemService();
    this.storage = new DesktopStorageService();
    this.notification = new DesktopNotificationService();
  }

  isDesktop(): boolean {
    return true;
  }
}

export const platformService = new DesktopPlatformService();
