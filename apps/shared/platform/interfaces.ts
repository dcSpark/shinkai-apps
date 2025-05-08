/**
 * Platform abstraction interfaces for Shinkai
 * These interfaces define the contract between platform-specific implementations
 * for desktop (Tauri) and web environments
 */

/**
 * File system service interface
 * Abstracts file operations that differ between desktop and web
 */
export interface FileSystemService {
  /**
   * Open a file picker and return the selected file
   */
  openFile(): Promise<File>;

  /**
   * Save content to a file
   * @param content Content to save
   * @param name Suggested file name
   */
  saveFile(content: string, name: string): Promise<void>;

  /**
   * Check if a file exists
   * @param path File path
   */
  fileExists(path: string): Promise<boolean>;
}

/**
 * Storage service interface
 * Abstracts persistent storage operations
 */
export interface StorageService {
  /**
   * Get a value from storage
   * @param key Storage key
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in storage
   * @param key Storage key
   * @param value Value to store
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove a value from storage
   * @param key Storage key
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all values from storage
   */
  clear(): Promise<void>;
}

/**
 * Notification service interface
 * Abstracts system notifications
 */
export interface NotificationService {
  /**
   * Show a notification
   * @param title Notification title
   * @param body Notification body
   */
  showNotification(title: string, body: string): Promise<void>;

  /**
   * Request notification permissions
   */
  requestPermission(): Promise<boolean>;

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean;
}

/**
 * Platform service interface
 * Provides access to all platform-specific services
 */
export interface PlatformService {
  fileSystem: FileSystemService;
  storage: StorageService;
  notification: NotificationService;
  
  /**
   * Check if running on desktop (Tauri) or web
   */
  isDesktop(): boolean;
}
