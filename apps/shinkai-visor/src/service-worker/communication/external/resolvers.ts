import { health } from '@shinkai_network/shinkai-message-ts/api';

import { useAuth } from '../../../store/auth/auth';
import { sendMessage } from '../internal';
import { ServiceWorkerInternalMessageType } from '../internal/types';
import {
  ServiceWorkerExternalMessageIsNodePristine,
  ServiceWorkerExternalMessageIsNodePristineResponse,
  ServiceWorkerExternalMessageQuickConnectionIntent,
  ServiceWorkerExternalMessageQuickConnectionIntentResponse,
  ServiceWorkerExternalMessageType,
} from './types';

export const isNodePristineResolver = async (
  message: ServiceWorkerExternalMessageIsNodePristine,
  tabId: number,
): Promise<ServiceWorkerExternalMessageIsNodePristineResponse> => {
  const nodeHealth = await health({
    node_address: message.payload.nodeAddress,
  });
  return {
    type: ServiceWorkerExternalMessageType.IsNodePristine,
    payload: {
      isPristine: nodeHealth.is_pristine,
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
  await sendMessage(
    {
      type: ServiceWorkerInternalMessageType.QuickConnectionIntent,
      data: {
        nodeAddress: message.payload.nodeAddress,
      },
    },
    tabId,
  );
  return {
    type: ServiceWorkerExternalMessageType.QuickConnectionIntent,
  };
};
