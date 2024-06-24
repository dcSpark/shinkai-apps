import {
  getAllInboxesForProfile,
  getLLMProviders,
  health,
} from '@shinkai_network/shinkai-message-ts/api';

import { useAuth } from '../../../store/auth/auth';
import { sendMessage } from '../internal';
import { ServiceWorkerInternalMessageType } from '../internal/types';
import {
  ServiceWorkerExternalMessageExportConnectionIntentResponse,
  ServiceWorkerExternalMessageGetProfileAgentsResponse,
  ServiceWorkerExternalMessageGetProfileInboxesResponse,
  ServiceWorkerExternalMessageIsConnected,
  ServiceWorkerExternalMessageIsConnectedResponse,
  ServiceWorkerExternalMessageIsInstalledResponse,
  ServiceWorkerExternalMessageIsNodePristine,
  ServiceWorkerExternalMessageIsNodePristineResponse,
  ServiceWorkerExternalMessageQuickConnectionIntent,
  ServiceWorkerExternalMessageQuickConnectionIntentResponse,
} from './types';

export const isInstalledResolver =
  async (): Promise<ServiceWorkerExternalMessageIsInstalledResponse> => {
    return {
      isInstalled: true,
      version: chrome.runtime.getManifest().version,
    };
  };

export const isNodeConnectedResolver = async ({
  nodeAddress,
}: ServiceWorkerExternalMessageIsConnected): Promise<ServiceWorkerExternalMessageIsConnectedResponse> => {
  return {
    isNodeConnected: useAuth.getState().auth?.node_address === nodeAddress,
  };
};

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
    const llmProviders = await getLLMProviders(
      auth.node_address,
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
      agents: llmProviders,
    };
  };

export const quickConnectionIntent = async ({
  nodeAddress,
}: ServiceWorkerExternalMessageQuickConnectionIntent): Promise<ServiceWorkerExternalMessageQuickConnectionIntentResponse> => {
  const auth = useAuth.getState().auth;
  if (auth) {
    throw new Error('visor is currently connected to a node');
  }
  sendMessage({
    type: ServiceWorkerInternalMessageType.QuickConnectionIntent,
    data: { nodeAddress: nodeAddress },
  });
  return;
};

export const getProfileInboxes =
  async (): Promise<ServiceWorkerExternalMessageGetProfileInboxesResponse> => {
    const auth = useAuth.getState().auth;
    if (!auth) {
      throw new Error('visor is not connected to a node');
    }
    const inboxes = await getAllInboxesForProfile(
      auth.node_address,
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

export const exportConnectionIntentResolver =
  async (): Promise<ServiceWorkerExternalMessageExportConnectionIntentResponse> => {
    return sendMessage({
      type: ServiceWorkerInternalMessageType.ExportConnectionIntent,
    });
  };
