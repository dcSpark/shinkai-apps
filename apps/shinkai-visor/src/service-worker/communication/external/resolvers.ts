import {
  ApiConfig,
  getAllInboxesForProfile,
  getProfileAgents,
  health,
} from '@shinkai_network/shinkai-message-ts/api';

import { useAuth } from '../../../store/auth/auth';
import { sendMessage } from '../internal';
import { ServiceWorkerInternalMessageType } from '../internal/types';
import {
  ServiceWorkerExternalMessageGetProfileAgents,
  ServiceWorkerExternalMessageGetProfileAgentsResponse,
  ServiceWorkerExternalMessageGetProfileInboxes,
  ServiceWorkerExternalMessageGetProfileInboxesResponse,
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

export const getProfileAgentsResolver = async (
  message: ServiceWorkerExternalMessageGetProfileAgents,
  tabId: number,
): Promise<ServiceWorkerExternalMessageGetProfileAgentsResponse> => {
  const auth = useAuth.getState().auth;
  if (!auth) {
    throw new Error('visor is not connected to a node');
  }
  ApiConfig.getInstance().setEndpoint(auth.node_address);
  const agents = await getProfileAgents(
    auth.shinkai_identity,
    auth.profile,
    auth.shinkai_identity,
    {
      my_device_encryption_sk: auth.profile_encryption_sk,
      my_device_identity_sk: auth.profile_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    },
  );
  return {
    type: ServiceWorkerExternalMessageType.GetProfileAgents,
    payload: {
      agents,
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

export const getProfileInboxes = async (
  message: ServiceWorkerExternalMessageGetProfileInboxes,
  tabId: number,
): Promise<ServiceWorkerExternalMessageGetProfileInboxesResponse> => {
  const auth = useAuth.getState().auth;
  if (!auth) {
    throw new Error('visor is not connected to a node');
  }
  ApiConfig.getInstance().setEndpoint(auth.node_address);
  const inboxes = await getAllInboxesForProfile(
    auth.shinkai_identity,
    auth.profile,
    auth.shinkai_identity,
    `${auth?.shinkai_identity}/${auth?.profile}`,
    {
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
  );
  return {
    type: ServiceWorkerExternalMessageType.GetProfileInboxes,
    payload: {
      inboxes,
    },
  };
};
