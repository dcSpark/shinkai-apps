import { WebviewWindow } from '@tauri-apps/api/window';

export const SHINKAI_NODE_MANAGER_WINDOW = 'shinkai-node-manager-window';
export const openShinkaiNodeManagerWindow = () => {
  const currentWindow = WebviewWindow.getByLabel(SHINKAI_NODE_MANAGER_WINDOW);
  if (currentWindow) {
    currentWindow.setFocus();
  } else {
    const webview = new WebviewWindow('shinkai-node-manager', {
      url: 'src/windows/shinkai-node-manager/index.html',
      title: 'Shinkai Node Manager',
      resizable: false,
    });
    webview.once('tauri://created', function () {
      console.log(`window started`);
    });
    webview.once('tauri://error', function (e) {
      console.log(`window error: ${JSON.stringify(e)}`);
    });
  }
};
