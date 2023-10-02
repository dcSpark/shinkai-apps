import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  ApiConfig,
  createChatWithMessage,
  getAllInboxesForProfile,
  getLastMessagesFromInbox,
  sendMessageToJob,
  sendTextMessageWithInbox,
} from '@shinkai_network/shinkai-message-ts/api';
import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  extractJobIdFromInbox,
  extractReceiverShinkaiName,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';

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
        profile_encryption_sk: node.credentials.profileEncryptionSharedKey,
        profile_identity_sk: node.credentials.profileSignatureSharedKey,
        node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
      }
    );
    return inboxes.map((inboxId) => ({ id: inboxId }));
  }
);

export const createInbox = createAsyncThunk<
  { inbox: Inbox; message: ShinkaiMessage },
  { receiverIdentity: string; message: string }
>('inbox/create', async (args, { getState }) => {
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
});

export const getLastsMessagesForInbox = createAsyncThunk<
  { inboxId: string; messages: ShinkaiMessage[] },
  { inboxId: string; count?: number | undefined; lastKey?: string | undefined }
>('inbox/messages/get-last-messages-for-inbox', async (args, { getState }) => {
  const defaultMessageCount = 10;
  const state = getState() as RootState;
  const node = state.node.data;
  if (!node) throw new Error('missing node data');

  ApiConfig.getInstance().setEndpoint(node.nodeData.nodeAddress);

  const data: ShinkaiMessage[] = await getLastMessagesFromInbox(
    args.inboxId,
    args.count || defaultMessageCount,
    args.lastKey,
    {
      shinkai_identity: node.nodeData.shinkaiIdentity,
      profile: node.nodeData.profile,
      profile_encryption_sk: node.credentials.profileEncryptionSharedKey,
      profile_identity_sk: node.credentials.profileSignatureSharedKey,
      node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
    }
  );
  return { inboxId: args.inboxId, messages: data };
});

export const sendMessage = createAsyncThunk<
  { inbox: Inbox; message?: ShinkaiMessage },
  { inboxId: string; message: string }
>('inbox/messages/send', async (args, { getState }) => {
  const state = getState() as RootState;
  const node = state.node.data;
  if (!node) throw new Error('missing node data');

  ApiConfig.getInstance().setEndpoint(node.nodeData.nodeAddress);

  if (isJobInbox(args.inboxId)) {
    const sender = `${node.nodeData.shinkaiIdentity}/${node.nodeData.profile}`;
    const jobId = extractJobIdFromInbox(args.inboxId);
    await sendMessageToJob(
      jobId,
      args.message,
      '',
      sender,
      node.nodeData.shinkaiIdentity,
      '',
      {
        my_device_encryption_sk: node.credentials.myDeviceEncryptionSharedKey,
        my_device_identity_sk: node.credentials.myDeviceIdentitySharedKey,
        node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
        profile_encryption_sk: node.credentials.profileEncryptionSharedKey,
        profile_identity_sk: node.credentials.profileSignatureSharedKey,
      }
    );
    // TODO: jobs didn't reply with the shinkai message you sent. fix it
    return { inbox: { id: args.inboxId }, message: undefined };
  }

  const sender = `${node.nodeData.shinkaiIdentity}/${node.nodeData.profile}/device/${node.userData.registrationName}`;
  const receiver = extractReceiverShinkaiName(args.inboxId, sender);
  const { inboxId, message } = await sendTextMessageWithInbox(
    sender,
    '',
    receiver,
    args.message,
    args.inboxId,
    {
      my_device_encryption_sk: node.credentials.myDeviceEncryptionSharedKey,
      my_device_identity_sk: node.credentials.myDeviceIdentitySharedKey,
      profile_encryption_sk: node.credentials.profileEncryptionSharedKey,
      profile_identity_sk: node.credentials.profileSignatureSharedKey,
      node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
    }
  );
  return { inbox: { id: inboxId }, message };
});
