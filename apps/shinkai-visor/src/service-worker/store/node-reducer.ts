import { createSlice } from "@reduxjs/toolkit";
import { Base58String, SetupPayload } from "@shinkai/shinkai-message-ts/models";

import { connectNode } from "./thunks";

export type SetupDetailsState = {
  profile: string;
  permission_type: string;
  registration_name: string;
  node_address: string;
  shinkai_identity: string;
  node_encryption_pk: Base58String;
  node_signature_pk: Base58String;
  profile_encryption_sk: Base58String;
  profile_encryption_pk: Base58String;
  profile_identity_sk: Base58String;
  profile_identity_pk: Base58String;
  my_device_encryption_sk: Base58String;
  my_device_encryption_pk: Base58String;
  my_device_identity_sk: Base58String;
  my_device_identity_pk: Base58String;
};

interface NodeStore {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string,
  setup?: SetupPayload,
  connected?: boolean,
}

export const nodeSlice = createSlice({
  name: 'none',
  initialState: {
    status: 'idle',
    error: undefined,
    setupData: undefined,
  } as NodeStore,
  reducers: {
    // omit
  },
  extraReducers(builder) {
    builder
      .addCase(connectNode.pending, (state, action) => {
        state.status = 'loading'
      })
    
      .addCase(connectNode.fulfilled, (state, action) => {
        state.status = 'succeeded'
      })
    
      .addCase(connectNode.rejected, (state, action) => {
        state.status = 'failed'
      })
  }
});
