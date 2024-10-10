import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { debug } from '@tauri-apps/plugin-log';
import { useEffect } from 'react';

import { useAuth } from './auth';
import { useSettings } from './settings';
import { useShinkaiNodeManager } from './shinkai-node-manager';

export type RehydrateStorageEvent = {
  triggeredBy: string;
};

const stores = [useAuth, useSettings, useShinkaiNodeManager];
const rehydrateStores = () => {
  stores.forEach((store) => store.persist.rehydrate());
};
export const useSyncStorage = () => {
  const currentWindowLabel = getCurrentWindow().label;
  useEffect(() => {
    debug('using sync storage');

    rehydrateStores();

    const handleStorageChange = (event: StorageEvent) => {
      debug(
        `firing storage rehydrate current-window${getCurrentWindow().label}`,
      );
      emit('rehydrate-storage', {
        triggeredBy: getCurrentWindow().label,
      });
    };

    const handleRehydrate = (triggeredBy: string) => {
      debug(
        `handling rehydrate triggeredBy:${currentWindowLabel} current-window:${currentWindowLabel}`,
      );
      if (triggeredBy === getCurrentWindow().label) {
        debug(
          `skipping rehydrate storage current-window:${currentWindowLabel}`,
        );
        return;
      }
      debug(
        `rehydrating storage triggeredBy${triggeredBy} current-window:${currentWindowLabel}`,
      );
      rehydrateStores();
    };

    window?.addEventListener('storage', (event: StorageEvent) =>
      handleStorageChange(event),
    );
    const unlistenRehydrateStorage = listen<RehydrateStorageEvent>(
      'rehydrate-storage',
      (event) => handleRehydrate(event.payload.triggeredBy),
    );

    return () => {
      window?.removeEventListener('storage', handleStorageChange);
      unlistenRehydrateStorage.then((fn) => fn());
    };
  }, []);
};
