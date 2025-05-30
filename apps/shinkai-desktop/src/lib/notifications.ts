import {} from '@tauri-apps/api';
import { debug } from '@tauri-apps/plugin-log';
import * as notification from '@tauri-apps/plugin-notification';
import { platform } from '@tauri-apps/plugin-os';

import LogoForNotification from '../assets/icon.png';

const getPlatformIcon = (platform: string): string => {
  switch (platform) {
    case 'win32': {
      return LogoForNotification;
    }
    case 'darwin': {
      return LogoForNotification;
    }
    default: {
      return LogoForNotification;
    }
  }
};

const { isPermissionGranted, requestPermission, sendNotification } =
  notification;

export const handleSendNotification = async (title?: string, body?: string) => {
  //ask for permission for notification
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    void debug('asking for permission');
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
  if (permissionGranted) {
    void debug('permission granted, sending notification');
    const icon = getPlatformIcon(await platform());

    const options: notification.Options = {
      title: title ?? 'Shinkai Desktop',
      body: body ?? '',
      icon: icon,
    };
    sendNotification(options);
  }
};
