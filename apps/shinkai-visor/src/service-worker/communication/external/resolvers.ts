import { useAuth } from '../../../store/auth/auth';
import { sendMessage } from '../internal';
import { ServiceWorkerInternalMessageType } from '../internal/types';
import {
  ServiceWorkerExternalMessageIsNodeAcceptingFirstConnection,
  ServiceWorkerExternalMessageIsNodeAcceptingFirstConnectionResponse,
  ServiceWorkerExternalMessageQuickConnectionIntent,
  ServiceWorkerExternalMessageQuickConnectionIntentResponse,
  ServiceWorkerExternalMessageType,
} from './types';

export const isNodeAcceptingFirstConnectionResolver = async (
  message: ServiceWorkerExternalMessageIsNodeAcceptingFirstConnection,
  tabId: number,
): Promise<ServiceWorkerExternalMessageIsNodeAcceptingFirstConnectionResponse> => {
  return {
    type: ServiceWorkerExternalMessageType.IsNodeAcceptingFirstConnection,
    payload: {
      isNodeAcceptingFirstConnection: true,
    },
  };
};

export const quickConnectionIntent = async (
  message: ServiceWorkerExternalMessageQuickConnectionIntent,
  tabId: number,
): Promise<ServiceWorkerExternalMessageQuickConnectionIntentResponse> => {
  const auth = useAuth.getState().auth;
  if (auth) {
    throw new Error('visor is currently connected to a node');
  }
  await sendMessage({
    type: ServiceWorkerInternalMessageType.QuickConnectionIntent,
    data: {
      nodeAddress: message.payload.nodeAddress,
    },
  }, tabId);
  return {
    type: ServiceWorkerExternalMessageType.QuickConnectionIntent,
  };
};
