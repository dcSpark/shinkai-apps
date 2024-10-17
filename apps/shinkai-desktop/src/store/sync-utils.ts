import { invoke } from '@tauri-apps/api/core';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { debug, error } from '@tauri-apps/plugin-log';
import { useEffect } from 'react';

import { isLocalShinkaiNode } from '../lib/shinkai-node-manager/shinkai-node-manager-windows-utils';
import { SetupData, useAuth } from './auth';
import { useExperimental } from './experimental';
import { useSettings } from './settings';
import { useShinkaiNodeManager } from './shinkai-node-manager';

export type RehydrateStorageEvent = {
  triggeredBy: string;
  store: string;
};

const stores = new Map(
  [useAuth, useSettings, useShinkaiNodeManager, useExperimental].map((s) => [
    s.persist.getOptions().name,
    s,
  ]),
);

const rehydrateStore = (store: string) => {
  stores.get(store)?.persist.rehydrate();
};

export const useSyncStorageSecondary = () => {
  useEffect(() => {
    const currentWindowLabel = getCurrentWindow().label;

    debug('using sync storage secondary');

    const handleRehydrate = (triggeredBy: string, store: string) => {
      debug(
        `${currentWindowLabel} rehydrating store:${store} triggeredBy:${triggeredBy}`,
      );
      rehydrateStore(store);
    };

    const unlistenRehydrateStorage = listen<RehydrateStorageEvent>(
      'rehydrate-storage',
      (event) =>
        handleRehydrate(event.payload.triggeredBy, event.payload.store),
    );

    return () => {
      unlistenRehydrateStorage.then((fn) => fn());
    };
  }, []);
};

const handleAuthSideEffect = async (
  auth: SetupData | null,
  prevAuth: SetupData | null,
) => {
  debug(`prev auth: ${prevAuth} --- new auth ${auth}`);
  // SignOut case
  if (prevAuth && !auth) {
    debug(
      `setting prevAuth:${JSON.stringify(prevAuth)} auth:${JSON.stringify(auth)}`,
    );
    useSettings.getState().setDefaultAgentId('');
    useSettings.getState().setDefaultSpotlightAiId('');
    useShinkaiNodeManager.getState().setIsInUse(false);
    return;
  }

  if (!prevAuth) {
    const isLocal = isLocalShinkaiNode(auth?.node_address || '');
    const isRunning: boolean = await invoke('shinkai_node_is_running');
    debug(`setting is in use isLocal:${isLocal} isRunning:${isRunning}`);
    useShinkaiNodeManager.getState().setIsInUse(isLocal && isRunning);
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
        store: event.key,
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
