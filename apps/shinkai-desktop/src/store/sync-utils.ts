import { useAuth } from '@shinkai_network/shinkai-node-state/store/auth';
import { emit, listen } from '@tauri-apps/api/event';

import { useSettings } from './settings';
import { useShinkaiNodeManager } from './shinkai-node-manager';

export const initSyncStorage = () => {
  window?.addEventListener('storage', () => {
    console.log('firing storage rehydrate');
    emit('rehydrate-storage', {
      theMessage: 'Tauri is awesome!',
    });
  });

  listen('rehydrate-storage', () => {
    console.log('rehydrating storage');
    useAuth.persist.rehydrate();
    useSettings.persist.rehydrate();
    useShinkaiNodeManager.persist.rehydrate();
  });
};
