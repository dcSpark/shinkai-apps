import { createAsyncThunk } from '@reduxjs/toolkit';
import { submitRegistrationCode } from '@shinkai/shinkai-message-ts/api';

import { NodeConnectionData } from './node-types';

export const connectNode = createAsyncThunk<NodeConnectionData, NodeConnectionData>(
  'node/connect',
  async (nodeConnectPayload) => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 3000);
    });
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
      return nodeConnectPayload;
    }
    throw new Error('unknown');
  }
);
