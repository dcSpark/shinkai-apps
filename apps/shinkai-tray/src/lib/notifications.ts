import { notification } from "@tauri-apps/api";
import { platform } from "@tauri-apps/api/os";

import LogoForNotification from "../assets/Square89x89Logo.png";

const getPlatformIcon = (platform: string): string => {
  switch (platform) {
    case "win32": {
      return LogoForNotification;
    }
    case "darwin": {
      return LogoForNotification;
    }
    default: {
      return LogoForNotification;
    }
  }
};

const { isPermissionGranted, requestPermission, sendNotification } = notification;

export const handleSendNotification = async (title?: string, body?: string) => {
  //ask for permission for notification
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }
  if (permissionGranted) {
    const icon = getPlatformIcon(await platform());

    const options: notification.Options = {
      title: title ?? "Shinkay Tray",
      body: body ?? "",
      icon: icon,
    };
    sendNotification(options);
  }
};
