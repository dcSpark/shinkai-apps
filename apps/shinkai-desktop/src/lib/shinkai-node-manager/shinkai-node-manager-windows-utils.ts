import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

export const SHINKAI_NODE_MANAGER_WINDOW = 'shinkai-node-manager-window';
export const openShinkaiNodeManagerWindow = async () => {
  const currentWindow = await WebviewWindow.getByLabel(
    SHINKAI_NODE_MANAGER_WINDOW,
  );
  if (currentWindow) {
    currentWindow.setFocus().catch((e) => e);
  } else {
    const webview = new WebviewWindow(SHINKAI_NODE_MANAGER_WINDOW, {
      url: 'src/windows/shinkai-node-manager/index.html',
      title: 'Shinkai Node Manager',
      resizable: true,
      width: 1280,
      height: 820,
    });
    webview.once('tauri://created', function () {
      console.log(`window started`);
    });
    webview.once('tauri://error', function (e) {
      console.log(`window error: ${JSON.stringify(e)}`);
    });
  }
};

export const isLocalShinkaiNode = (nodeAddress: string) => {
  const isLocalShinkaiNode =
    nodeAddress.includes('localhost') || nodeAddress.includes('127.0.0.1');
  return isLocalShinkaiNode;
};

export const isHostingShinkaiNode = (nodeAddress: string) => {
  return nodeAddress?.includes('hosting.shinkai.com');
};
