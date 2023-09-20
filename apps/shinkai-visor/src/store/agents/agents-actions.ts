import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  addAgent as addAgentApi,
  ApiConfig,
  getProfileAgents,
} from '@shinkai_network/shinkai-message-ts/api';
import {
  AgentAPIModel,
  SerializedAgent,
} from '@shinkai_network/shinkai-message-ts/models';
import { extractReceiverShinkaiName } from '@shinkai_network/shinkai-message-ts/utils';

import { RootState } from '..';

export const addAgent = createAsyncThunk<
  { agent: SerializedAgent },
  {
    agent: {
      agentName: string;
      externalUrl: string;
      apiKey: string;
      model: AgentAPIModel;
    };
  }
>('agens/add', async (args, { getState }) => {
  const state = getState() as RootState;
  const node = state.node.data;
  if (!node) throw new Error('missing node data');

  ApiConfig.getInstance().setEndpoint(node.nodeData.nodeAddress);

  const result = await addAgentApi(
    node.nodeData.profile,
    node.nodeData.shinkaiIdentity,
    {
      id: args.agent.agentName,
      full_identity_name: `${node.nodeData.shinkaiIdentity}/${node.nodeData.profile}/agent/${args.agent.agentName}`,
      perform_locally: false,
      toolkit_permissions: [],
      storage_bucket_permissions: [],
      allowed_message_senders: [],
      model: args.agent.model,
    },
    {
      my_device_encryption_sk: node.credentials.myDeviceEncryptionSharedKey,
      my_device_identity_sk: node.credentials.myDeviceIdentitySharedKey,
      node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
      profile_encryption_sk: node.credentials.profileEncryptionSharedKey,
      profile_identity_sk: node.credentials.profileSignatureSharedKey,
    }
  );
  return { agent: result };
});

export const getAgents = createAsyncThunk<{ agents: SerializedAgent[] }, void>(
  'agens/all',
  async (args, { getState }) => {
    const state = getState() as RootState;
    const node = state.node.data;
    if (!node) throw new Error('missing node data');

    ApiConfig.getInstance().setEndpoint(node.nodeData.nodeAddress);
    const sender = node.nodeData.shinkaiIdentity;
    const senderSubidentity = `${node.nodeData.profile}/device/${node.userData.registrationName}`;

    const result = await getProfileAgents(
      sender,
      senderSubidentity,
      node.nodeData.shinkaiIdentity,
      {
        my_device_encryption_sk: node.credentials.myDeviceEncryptionSharedKey,
        my_device_identity_sk: node.credentials.myDeviceIdentitySharedKey,
        node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
      }
    );
    return { agents: result };
  }
);
