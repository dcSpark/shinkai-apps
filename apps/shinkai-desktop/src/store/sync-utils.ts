import { invoke } from '@tauri-apps/api/core';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { debug } from '@tauri-apps/plugin-log';
import { useEffect } from 'react';

import { isLocalShinkaiNode } from '../lib/shinkai-node-manager/shinkai-node-manager-windows-utils';
import { SetupData, useAuth } from './auth';
import { useSettings } from './settings';
import { useShinkaiNodeManager } from './shinkai-node-manager';

export type RehydrateStorageEvent = {
  triggeredBy: string;
};

const stores = [useAuth, useSettings, useShinkaiNodeManager];
const rehydrateStores = () => {
  stores.forEach((store) => store.persist.rehydrate());
};
export const useSyncStorageSecondary = () => {
  useEffect(() => {
    const currentWindowLabel = getCurrentWindow().label;

    debug('using sync storage secondary');

    rehydrateStores();

    const handleRehydrate = (triggeredBy: string) => {
      debug(
        `handling rehydrate triggeredBy:${currentWindowLabel} current-window:${currentWindowLabel}`,
      );
      if (triggeredBy === currentWindowLabel) {
        debug(
          `skipping rehydrate storage current-window:${currentWindowLabel}`,
        );
        return;
      }
      debug(
        `rehydrating storage triggeredBy:${triggeredBy} current-window:${currentWindowLabel}`,
      );
      rehydrateStores();
    };

    const unlistenRehydrateStorage = listen<RehydrateStorageEvent>(
      'rehydrate-storage',
      (event) => handleRehydrate(event.payload.triggeredBy),
    );

    return () => {
      unlistenRehydrateStorage.then((fn) => fn());
    };
  }, []);
};

export const useSyncStorageMain = () => {
  useSyncStorageSecondary();
  useSyncStorageSideEffects();
  useEffect(() => {
    const currentWindowLabel = getCurrentWindow().label;
    debug('using sync storage');
    const handleStorageChange = (event: StorageEvent) => {
      debug(`firing storage rehydrate current-window:${currentWindowLabel}`);
      emit('rehydrate-storage', {
        triggeredBy: currentWindowLabel,
      });
    };

    window?.addEventListener('storage', (event: StorageEvent) =>
      handleStorageChange(event),
    );

    return () => {
      window?.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};

const handleAuthSideEffect = async (
  auth: SetupData | null,
  prevAuth: SetupData | null,
) => {
  // SignOut case
  if (prevAuth && !auth) {
    useSettings.getState().setDefaultAgentId('');
    useShinkaiNodeManager.getState().setIsInUse(false);
    return;
  }

  if (!prevAuth) {
    const isLocal = isLocalShinkaiNode(auth?.node_address || '');
    const isRunning: boolean = await invoke('shinkai_node_is_running');
    useShinkaiNodeManager.getState().setIsInUse(isLocal && isRunning);
  }
};

export const useSyncStorageSideEffects = () => {
  useEffect(() => {
    const authUnsubscribe = useAuth.subscribe((state, prevState) => {
      debug('auth changed from settings');
      handleAuthSideEffect(state.auth, prevState.auth);
    });
    return () => {
      authUnsubscribe();
    };
  }, []);
};
