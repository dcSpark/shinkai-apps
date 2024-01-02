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
  ServiceWorkerExternalMessageGetProfileAgentsResponse,
  ServiceWorkerExternalMessageGetProfileInboxesResponse,
  ServiceWorkerExternalMessageIsNodePristine,
  ServiceWorkerExternalMessageIsNodePristineResponse,
  ServiceWorkerExternalMessageQuickConnectionIntent,
  ServiceWorkerExternalMessageQuickConnectionIntentResponse,
} from './types';

export const isNodePristineResolver = async ({
  nodeAddress,
}: ServiceWorkerExternalMessageIsNodePristine): Promise<ServiceWorkerExternalMessageIsNodePristineResponse> => {
  const nodeHealth = await health({
    node_address: nodeAddress,
  });
  return {
    isPristine: nodeHealth.is_pristine,
  };
};

export const getProfileAgentsResolver =
  async (): Promise<ServiceWorkerExternalMessageGetProfileAgentsResponse> => {
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
      agents,
    };
  };

export const quickConnectionIntent = async (
  { nodeAddress }: ServiceWorkerExternalMessageQuickConnectionIntent,
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
        nodeAddress: nodeAddress,
      },
    },
    tabId,
  );
  return;
};

export const getProfileInboxes =
  async (): Promise<ServiceWorkerExternalMessageGetProfileInboxesResponse> => {
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
      inboxes,
    };
  };
