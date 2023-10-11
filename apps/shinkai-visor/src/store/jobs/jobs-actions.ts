import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  ApiConfig,
  createJob as createJobApi,
  sendMessageToJob,
} from '@shinkai_network/shinkai-message-ts/api';
import { JobCreationWrapper,JobScopeWrapper } from "@shinkai_network/shinkai-message-ts/wasm";

import { RootState } from '..';
import { Job } from './jobs-types';

export const createJob = createAsyncThunk<
  { job: Job },
  {
    agentId: string,
    content: string,
  }
>('jobs/create', async (args, { getState }) => {
  const state = getState() as RootState;
  const node = state.node.data;
  if (!node) throw new Error('missing node data');

  ApiConfig.getInstance().setEndpoint(node.nodeData.nodeAddress);

  const receiver_subidentity = `${node.nodeData.profile}/agent/${args.agentId}`;

  const job_creation = JobCreationWrapper.empty().get_scope;
  const scope = new JobScopeWrapper(
    job_creation.buckets,
    job_creation.documents
  );

  const jobId = await createJobApi(
    scope.to_jsvalue(),
    node.nodeData.shinkaiIdentity,
    node.nodeData.profile,
    node.nodeData.shinkaiIdentity,
    receiver_subidentity,
    {
      my_device_encryption_sk: node.credentials.myDeviceEncryptionSharedKey,
      my_device_identity_sk: node.credentials.myDeviceIdentitySharedKey,
      node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
      profile_encryption_sk: node.credentials.profileEncryptionSharedKey,
      profile_identity_sk: node.credentials.profileSignatureSharedKey,
    }
  );

  await sendMessageToJob(
    jobId,
    args.content,
    '',
    node.nodeData.shinkaiIdentity,
    node.nodeData.profile,
    node.nodeData.shinkaiIdentity,
    receiver_subidentity,
    {
      my_device_encryption_sk: node.credentials.myDeviceEncryptionSharedKey,
      my_device_identity_sk: node.credentials.myDeviceIdentitySharedKey,
      node_encryption_pk: node.nodeData.nodeEncryptionPublicKey,
      profile_encryption_sk: node.credentials.profileEncryptionSharedKey,
      profile_identity_sk: node.credentials.profileSignatureSharedKey,
    }
  );
  return { job: { id: jobId } };
});
