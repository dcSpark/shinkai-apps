import { invoke } from '@tauri-apps/api/core';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { debug } from '@tauri-apps/plugin-log';
import { useEffect } from 'react';

import { isLocalShinkaiNode } from '../lib/shinkai-node-manager/shinkai-node-manager-windows-utils';
import { Auth, useAuth } from './auth';
import { useExperimental } from './experimental';
import { useSettings } from './settings';
import { useShinkaiNodeManager } from './shinkai-node-manager';

export type RehydrateStorageEvent = {
  triggeredBy: string;
  stores: string[];
};

const stores = new Map(
  [useAuth, useSettings, useShinkaiNodeManager, useExperimental].map((s) => [
    s.persist.getOptions().name,
    s,
  ]),
);

const rehydrateStore = (targetStores: string[]) => {
  targetStores.forEach((storeName) =>
    stores.get(storeName)?.persist.rehydrate(),
  );
};

export const useSyncStorageSecondary = () => {
  useEffect(() => {
    const currentWindowLabel = getCurrentWindow().label;

    debug('using sync storage secondary');

    const handleRehydrate = (triggeredBy: string, targetStores: string[]) => {
      debug(
        `${currentWindowLabel} rehydrating stores:${targetStores?.join(',')} triggeredBy:${triggeredBy}`,
      );
      rehydrateStore(targetStores);
    };

    const unlistenRehydrateStorage = listen<RehydrateStorageEvent>(
      'rehydrate-storage',
      (event) =>
        handleRehydrate(event.payload.triggeredBy, event.payload.stores),
    );

    return () => {
      unlistenRehydrateStorage.then((fn) => fn());
    };
  }, []);
};

const handleAuthSideEffect = async (
  auth: Auth | null,
  prevAuth: Auth | null,
) => {
  debug(`prev auth: ${prevAuth} --- new auth ${auth}`);
  const currentWindowLabel = getCurrentWindow().label;
  // SignOut case
  if (prevAuth && !auth) {
    debug(
      `setting prevAuth:${JSON.stringify(prevAuth)} auth:${JSON.stringify(auth)}`,
    );
    useSettings.getState().resetSettings();
    useShinkaiNodeManager.getState().setIsInUse(false);
    emit('rehydrate-storage', {
      triggeredBy: currentWindowLabel,
      stores: ['settings', 'shinkai-node-options'],
    });
    return;
  }

  if (!prevAuth) {
    const isLocal = isLocalShinkaiNode(auth?.node_address || '');
    const isRunning: boolean = await invoke('shinkai_node_is_running');
    debug(`setting is in use isLocal:${isLocal} isRunning:${isRunning}`);
    useShinkaiNodeManager.getState().setIsInUse(isLocal && isRunning);
    emit('rehydrate-storage', {
      triggeredBy: currentWindowLabel,
      stores: ['settings', 'shinkai-node-options'],
    });
  }
};

export const useSyncStorageSideEffects = () => {
  debug('using useSyncStorageSideEffects');
  useEffect(() => {
    const authUnsubscribe = useAuth.subscribe((state, prevState) => {
      debug('auth state changed');
      handleAuthSideEffect(state.auth, prevState.auth);
    });
    return () => {
      authUnsubscribe();
    };
  }, []);
};

export const useSyncStorageMain = () => {
  useEffect(() => {
    const currentWindowLabel = getCurrentWindow().label;
    debug('using sync storage main');
    const handleStorageChange = (event: StorageEvent) => {
      debug(
        `${currentWindowLabel} storage:${event.key} changed by ${event.url}, emitting rehydrate-storage...`,
      );
      emit('rehydrate-storage', {
        triggeredBy: currentWindowLabel,
        stores: [event.key],
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
