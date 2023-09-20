import { createAsyncThunk } from '@reduxjs/toolkit';
import { submitRegistrationCode } from '@shinkai_network/shinkai-message-ts/api';

import { authenticated } from '../auth/auth-actions';
import { NodeConnectionData } from './node-types';

export const connectNode = createAsyncThunk<NodeConnectionData, NodeConnectionData>(
  'node/connect',
  async (nodeConnectPayload, { dispatch }) => {
    const success = await submitRegistrationCode({
      // Node data
      registration_code: nodeConnectPayload.nodeData.registrationCode,
      identity_type: nodeConnectPayload.nodeData.identityType,
      permission_type: nodeConnectPayload.nodeData.permissionType,
      profile: nodeConnectPayload.nodeData.profile,
      shinkai_identity: nodeConnectPayload.nodeData.identityType,
      node_address: nodeConnectPayload.nodeData.nodeAddress,

      // User device / profile data
      registration_name: nodeConnectPayload.userData.registrationName,

      // User keypairs
      my_device_encryption_sk:
        nodeConnectPayload.credentials.myDeviceEncryptionSharedKey,
      my_device_identity_sk:
        nodeConnectPayload.credentials.myDeviceIdentitySharedKey,
      profile_encryption_sk:
        nodeConnectPayload.credentials.profileEncryptionSharedKey,
      profile_identity_sk:
        nodeConnectPayload.credentials.profileSignatureSharedKey,
      node_encryption_pk: nodeConnectPayload.nodeData.nodeEncryptionPublicKey,
    });
    if (success) {
      dispatch(authenticated(true));
      return nodeConnectPayload;
    }
    throw new Error('unknown');
  }
);

export const disconnectNode = createAsyncThunk(
  'node/disconnect',
  async (_, { dispatch }) => {
    dispatch(authenticated(false));
  }
);
