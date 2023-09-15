import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiConfig, getAllInboxesForProfile, submitRegistrationCode } from '@shinkai/shinkai-message-ts/api';

import { RootState } from '..';
import { Inbox } from './inbox-types';

export const getAllInboxes = createAsyncThunk<Inbox[], void>(
  'inbox/all',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const node = state.node.data;
    if (!node) throw new Error('missing node data');

    console.log('getState', getState());
    ApiConfig.getInstance().setEndpoint(node.nodeData.nodeAddress);

    // Local identity
    const sender = node?.nodeData.shinkaiIdentity;
    const senderSubidentity = `${node.nodeData.profile}/device/${node?.userData.registrationName}`;

    // Assuming receiver and target_shinkai_name_profile are the same as sender
    const receiver = sender;
    const targetShinkaiNameProfile = `${sender}/${node.nodeData.profile}`;

    console.log({
      sender,
      senderSubidentity,
      receiver,
      targetShinkaiNameProfile,
      patata: {
        my_device_encryption_sk: node.credentials.myDeviceEncryptionSharedKey,
        my_device_identity_sk: node.credentials.myDeviceIdentitySharedKey,
        node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
      }
    });
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
