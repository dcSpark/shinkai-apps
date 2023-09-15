import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiConfig, createChatWithMessage, getAllInboxesForProfile } from '@shinkai/shinkai-message-ts/api';
import { ShinkaiMessage } from '@shinkai/shinkai-message-ts/models';

import { RootState } from '..';
import { Inbox } from './inbox-types';

export const getAllInboxes = createAsyncThunk<Inbox[], void>(
  'inbox/all',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const node = state.node.data;
    if (!node) throw new Error('missing node data');

    ApiConfig.getInstance().setEndpoint(node.nodeData.nodeAddress);

    // Local identity
    const sender = node?.nodeData.shinkaiIdentity;
    const senderSubidentity = `${node.nodeData.profile}/device/${node?.userData.registrationName}`;

    // Assuming receiver and target_shinkai_name_profile are the same as sender
    const receiver = sender;
    const targetShinkaiNameProfile = `${sender}/${node.nodeData.profile}`;

    // TODO: Improve this async call to be react friendly
    const inboxes = await getAllInboxesForProfile(
      sender,
      senderSubidentity,
      receiver,
      targetShinkaiNameProfile,
      {
        my_device_encryption_sk: node.credentials.myDeviceEncryptionSharedKey,
        my_device_identity_sk: node.credentials.myDeviceIdentitySharedKey,
        node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
      }
    );
    return inboxes.map(inboxId => ({ id: inboxId }));
  }
);

export const createInbox = createAsyncThunk<{ inbox: Inbox, message: ShinkaiMessage }, { receiverIdentity: string, message: string }>(
  'inbox/create',
  async (args, { getState }) => {
    const state = getState() as RootState;
    const node = state.node.data;
    if (!node) throw new Error('missing node data');

    ApiConfig.getInstance().setEndpoint(node.nodeData.nodeAddress);

    const [receiver, ...rest] = args.receiverIdentity.split('/');
    // Join the rest back together to form sender_subidentity
    const receiverSubIdentity = rest.join('/');

    const sender = node.nodeData.shinkaiIdentity;
    const senderSubidentity = `${node.nodeData.profile}/device/${node.userData.registrationName}`;

    // Send a message to someone
    const { inboxId, message } = await createChatWithMessage(
      sender,
      senderSubidentity,
      receiver,
      receiverSubIdentity,
      args.message,
      {
        my_device_encryption_sk: node.credentials.myDeviceEncryptionSharedKey,
        my_device_identity_sk: node.credentials.myDeviceIdentitySharedKey,
        node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
      }
    );
    return { inbox: { id: inboxId }, message };
  }
);
