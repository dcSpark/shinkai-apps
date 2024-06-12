import { Event, EventCallback, listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

import {
  ShinkaiNodeManagerEvent,
  ShinkaiNodeManagerEventMap,
} from './shinkai-node-manager-client-types';
import {
  ollamaStartedToast,
  ollamaStartErrorToast,
  ollamaStopErrorToast,
  ollamaStoppedToast,
  pullingModelDoneToast,
  pullingModelErrorToast,
  pullingModelProgressToast,
  pullingModelStartToast,
  shinkaiNodeStartedToast,
  shinkaiNodeStartErrorToast,
  shinkaiNodeStopErrorToast,
  shinkaiNodeStoppedToast,
  startingOllamaToast,
  startingShinkaiNodeToast,
  stoppingOllamaToast,
  stoppingShinkaiNodeToast,
} from './shinkai-node-manager-toasts-utils';

/**
 * Custom React hook to subscribe to Tauri events.
 * @param eventName The name of the event to subscribe to.
 * @param callback The callback function to execute when the event is received.
 */
const useTauriEvent = <T>(eventName: string, callback: EventCallback<T>) => {
  useEffect(() => {
    // Subscribe to the Tauri event
    const unsubscribe = listen(eventName, (event: Event<T>) => {
      callback(event);
    });

    // Cleanup subscription on component unmount
    return () => {
      unsubscribe.then((unsub) => unsub());
    };
  }, [eventName, callback]);
};

export const useShinkaiNodeStateChange = (
  callback: EventCallback<ShinkaiNodeManagerEventMap>,
) => {
  return useTauriEvent<ShinkaiNodeManagerEventMap>(
    'shinkai-node-state-change',
    callback,
  );
};

export const mapEvent = (
  event: object | string,
): ShinkaiNodeManagerEventMap => {
  if (typeof event === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      type: Object.keys(event)[0] as ShinkaiNodeManagerEvent,
      payload: Object.values(event)[0],
    } as any;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { type: event as ShinkaiNodeManagerEvent } as any;
  }
};

export const useShinkaiNodeEventsToast = () => {
  useShinkaiNodeStateChange((event) => {
    const shinkaiNodeEvent = mapEvent(event.payload);
    switch (shinkaiNodeEvent.type) {
      case ShinkaiNodeManagerEvent.StartingShinkaiNode:
        startingShinkaiNodeToast();
        break;
      case ShinkaiNodeManagerEvent.ShinkaiNodeStarted:
        shinkaiNodeStartedToast();
        break;
      case ShinkaiNodeManagerEvent.ShinkaiNodeStartError:
        shinkaiNodeStartErrorToast();
        break;

      case ShinkaiNodeManagerEvent.StoppingShinkaiNode:
        stoppingShinkaiNodeToast();
        break;
      case ShinkaiNodeManagerEvent.ShinkaiNodeStopped:
        shinkaiNodeStoppedToast();
        break;
      case ShinkaiNodeManagerEvent.ShinkaiNodeStopError:
        shinkaiNodeStopErrorToast();
        break;

      case ShinkaiNodeManagerEvent.StartingOllama:
        startingOllamaToast();
        break;
      case ShinkaiNodeManagerEvent.OllamaStarted:
        ollamaStartedToast();
        break;
      case ShinkaiNodeManagerEvent.OllamaStartError:
        ollamaStartErrorToast();
        break;

      case ShinkaiNodeManagerEvent.StoppingOllama:
        stoppingOllamaToast();
        break;
      case ShinkaiNodeManagerEvent.OllamaStopped:
        ollamaStoppedToast();
        break;
      case ShinkaiNodeManagerEvent.OllamaStopError:
        ollamaStopErrorToast();
        break;

      case ShinkaiNodeManagerEvent.PullingModelStart:
        pullingModelStartToast(shinkaiNodeEvent.payload.model);
        break;
      case ShinkaiNodeManagerEvent.PullingModelProgress:
        pullingModelProgressToast(
          shinkaiNodeEvent.payload.model,
          shinkaiNodeEvent.payload.progress,
        );
        break;
      case ShinkaiNodeManagerEvent.PullingModelDone:
        pullingModelDoneToast(shinkaiNodeEvent.payload.model);
        break;
      case ShinkaiNodeManagerEvent.PullingModelError:
        pullingModelErrorToast(shinkaiNodeEvent.payload.model);
        break;
      default:
        console.warn('Unhandled Shinkai Node state change:', event);
    }
  });
};
