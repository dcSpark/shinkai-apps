import { invoke } from '@tauri-apps/api/core';

export const openShinkaiNodeManagerWindow = async () => {
  return invoke('show_shinkai_node_manager_window');
};

export const isLocalShinkaiNode = (nodeAddress: string) => {
  const isLocalShinkaiNode =
    nodeAddress.includes('localhost') || nodeAddress.includes('127.0.0.1');
  return isLocalShinkaiNode;
};

export const isHostingShinkaiNode = (nodeAddress: string) => {
  return nodeAddress?.includes('hosting.shinkai.com');
};
